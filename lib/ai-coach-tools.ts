import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const searchExercisesSchema = z.object({
  query: z.string().describe('Search term: body part, muscle name, exercise name, or equipment. Examples: "shoulders", "chest", "biceps", "dumbbell"'),
  limit: z.number().max(20).default(10).describe('Max results to return'),
});

const createCircuitSchema = z.object({
  name: z.string().max(100),
  rounds: z.number().min(1).max(10),
  restBetweenRounds: z.number().min(10).max(120),
  exercises: z
    .array(
      z.object({
        exerciseId: z.string(),
        durationSec: z.number().min(10).max(120),
        restSec: z.number().min(5).max(60),
      })
    )
    .min(2)
    .max(10),
});

export function createAiCoachTools(userId: string) {
  return {
    searchExercises: tool({
      description:
        'Search exercises in the database by body part, equipment, target, muscle group, or name',
      inputSchema: searchExercisesSchema,
      execute: async ({
        query,
        limit,
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
           ORDER BY name LIMIT $2`,
          searchTerm,
          limit
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
        exercises,
      }: z.infer<typeof createCircuitSchema>) => {
        const ids = exercises.map((exercise: { exerciseId: string }) => exercise.exerciseId);
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
            rounds,
            restBetweenRounds,
            userId,
            exercises: {
              create: exercises.map((exercise: { exerciseId: string; durationSec: number; restSec: number }, index: number) => ({
                exerciseId: exercise.exerciseId,
                durationSec: exercise.durationSec,
                restSec: exercise.restSec,
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
      },
    }),
  };
}
