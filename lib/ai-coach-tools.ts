import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const searchExercisesSchema = z.object({
  query: z.string().describe('Search term: body part, muscle name, exercise name, or equipment'),
});

const createCircuitSchema = z.object({
  name: z.string().describe('Name of the circuit'),
  rounds: z.number().describe('Number of rounds (1-10)'),
  restBetweenRounds: z.number().describe('Rest between rounds in seconds (10-120)'),
  exerciseIds: z.string().describe('Comma-separated exercise IDs'),
  durations: z.string().describe('Comma-separated duration in seconds for each exercise'),
  rests: z.string().describe('Comma-separated rest in seconds after each exercise'),
});

export function createAiCoachTools(userId: string) {
  return {
    searchExercises: tool({
      description:
        'Search exercises in the database by body part, equipment, target, muscle group, or name',
      inputSchema: searchExercisesSchema,
      execute: async ({
        query,
      }: z.infer<typeof searchExercisesSchema>) => {
        try {
        const searchTerm = `%${query}%`;

        type ExerciseRow = {
          id: string;
          name: string;
          body_part: string;
          equipment: string;
          target: string;
          gif_url: string;
        };

        const results: ExerciseRow[] = await prisma.$queryRawUnsafe(
          `SELECT id, name, body_part, equipment, target, gif_url FROM exercises
           WHERE name ILIKE $1 OR body_part ILIKE $1 OR target ILIKE $1 OR muscle_group ILIKE $1 OR equipment ILIKE $1
           ORDER BY name LIMIT 10`,
          searchTerm
        );

        return results.map((result: ExerciseRow) => ({
          id: result.id,
          name: result.name,
          bodyPart: result.body_part,
          equipment: result.equipment,
          target: result.target,
          gifUrl: result.gif_url,
        }));
        } catch (error) {
          console.error('[searchExercises] Error:', error);
          return [{ id: 'error', name: `Error: ${String(error)}`, bodyPart: '', equipment: '', target: '', gifUrl: '' }];
        }
      },
    }),

    createCircuit: tool({
      description:
        'Save a completed circuit to the database for the current user. Only call this after the user confirms the circuit.',
      inputSchema: createCircuitSchema,
      execute: async ({
        name,
        rounds,
        restBetweenRounds,
        exerciseIds,
        durations,
        rests,
      }: z.infer<typeof createCircuitSchema>) => {
        try {
        const ids = exerciseIds.split(',').map(s => s.trim());
        const durationArr = durations.split(',').map(s => parseInt(s.trim(), 10));
        const restArr = rests.split(',').map(s => parseInt(s.trim(), 10));

        if (ids.length < 2) return { success: false, error: 'Need at least 2 exercises' };

        const found: Array<{ id: string }> = await prisma.$queryRawUnsafe(
          'SELECT id FROM exercises WHERE id = ANY($1::text[])',
          ids
        );

        if (found.length !== ids.length) {
          return { success: false, error: 'Some exercises not found in database' };
        }

        const circuit = await prisma.sharedCircuit.create({
          data: {
            name,
            rounds: Math.min(10, Math.max(1, rounds)),
            restBetweenRounds: Math.min(120, Math.max(10, restBetweenRounds)),
            userId,
            exercises: {
              create: ids.map((id, index) => ({
                exerciseId: id,
                durationSec: durationArr[index] || 30,
                restSec: restArr[index] || 10,
                order: index + 1,
              })),
            },
          },
          include: { exercises: true },
        });

        return {
          success: true,
          circuitId: circuit.id,
          shareSlug: circuit.shareSlug,
          name: circuit.name,
          exerciseCount: circuit.exercises.length,
        };
        } catch (error) {
          console.error('[createCircuit] Error:', error);
          return { success: false, error: String(error) };
        }
      },
    }),
  };
}
