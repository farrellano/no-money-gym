import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const circuit = await prisma.sharedCircuit.findUnique({
    where: { shareSlug: slug },
    include: {
      user: { select: { username: true } },
      exercises: { orderBy: { order: 'asc' } },
    },
  });

  if (!circuit) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const exerciseIds = circuit.exercises.map((exercise: { exerciseId: string }) => exercise.exerciseId);
  const exerciseDetails = exerciseIds.length
    ? await prisma.$queryRawUnsafe<
        Array<{
          id: string;
          name: string;
          gif_url: string;
          body_part: string;
        }>
      >(
        'SELECT id, name, gif_url, body_part FROM exercises WHERE id = ANY($1)',
        exerciseIds
      )
    : [];

  type ExerciseDetail = { id: string; name: string; gif_url: string; body_part: string };
  const detailsMap = new Map<string, ExerciseDetail>(exerciseDetails.map((exercise: ExerciseDetail) => [exercise.id, exercise]));

  return NextResponse.json({
    id: circuit.id,
    name: circuit.name,
    rounds: circuit.rounds,
    restBetweenRounds: circuit.restBetweenRounds,
    createdBy: circuit.user.username,
    shareSlug: circuit.shareSlug,
    exercises: circuit.exercises.map((exercise: { exerciseId: string; durationSec: number; restSec: number; order: number }) => {
      const details = detailsMap.get(exercise.exerciseId);

      return {
        exerciseId: exercise.exerciseId,
        name: details?.name || 'Unknown',
        gifUrl: details?.gif_url || '',
        bodyPart: details?.body_part || '',
        durationSec: exercise.durationSec,
        restSec: exercise.restSec,
        order: exercise.order,
      };
    }),
  });
}
