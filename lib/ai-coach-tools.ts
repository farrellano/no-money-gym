import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const searchExercisesSchema = z.object({
  bodyPart: z
    .enum([
      'back',
      'cardio',
      'chest',
      'lower arms',
      'lower legs',
      'neck',
      'shoulders',
      'upper arms',
      'upper legs',
      'waist',
    ])
    .optional(),
  equipment: z.string().optional(),
  target: z.string().optional(),
  muscleGroup: z.string().optional(),
  query: z.string().optional(),
  limit: z.number().max(20).default(10),
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
        bodyPart,
        equipment,
        target,
        muscleGroup,
        query,
        limit,
      }: z.infer<typeof searchExercisesSchema>) => {
        const conditions: string[] = [];
        const params: unknown[] = [];
        let paramIndex = 1;

        if (bodyPart) {
          conditions.push(`body_part = $${paramIndex++}`);
          params.push(bodyPart);
        }
        if (equipment) {
          conditions.push(`equipment ILIKE $${paramIndex++}`);
          params.push(`%${equipment}%`);
        }
        if (target) {
          conditions.push(`target ILIKE $${paramIndex++}`);
          params.push(`%${target}%`);
        }
        if (muscleGroup) {
          conditions.push(`muscle_group ILIKE $${paramIndex++}`);
          params.push(`%${muscleGroup}%`);
        }
        if (query) {
          conditions.push(`name ILIKE $${paramIndex++}`);
          params.push(`%${query}%`);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        params.push(limit);

        type ExerciseRow = {
          id: string;
          name: string;
          body_part: string;
          equipment: string;
          target: string;
          gif_url: string;
        };

        const results: ExerciseRow[] = await prisma.$queryRawUnsafe(
          `SELECT id, name, body_part, equipment, target, gif_url FROM exercises ${where} ORDER BY name LIMIT $${paramIndex}`,
          ...params
        );

        return results.map((result: ExerciseRow) => ({
          id: result.id,
          name: result.name,
          bodyPart: result.body_part,
          equipment: result.equipment,
          target: result.target,
          gifUrl: result.gif_url,
        }));
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
