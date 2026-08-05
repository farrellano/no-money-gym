import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username || !USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters, alphanumeric and underscores only' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    const userAgent = req.headers.get('user-agent') || undefined;

    const user = await prisma.user.create({
      data: { username, userAgent },
    });

    return NextResponse.json({ userId: user.id, username: user.username });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
