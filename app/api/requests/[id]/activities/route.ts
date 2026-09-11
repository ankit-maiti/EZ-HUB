import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { message, actorId, type = 'NOTE_ADDED' } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Note or activity message cannot be empty' },
        { status: 400 }
      );
    }

    const activity = await prisma.requestActivity.create({
      data: {
        requestId: id,
        actorId: actorId || null,
        type,
        message: message.trim(),
      },
      include: {
        actor: true,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error adding activity:', error);
    return NextResponse.json(
      { error: 'Failed to add activity' },
      { status: 500 }
    );
  }
}
