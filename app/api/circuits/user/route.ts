import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json([], { status: 200 });
  }

  const circuits = await prisma.sharedCircuit.findMany({
    where: { userId },
    include: { exercises: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(circuits);
}
