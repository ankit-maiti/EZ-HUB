import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { completed, actorId } = body;

    const followUp = await prisma.followUp.findUnique({
      where: { id },
      include: { request: true },
    });

    if (!followUp) {
      return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 });
    }

    const completedAt = completed ? new Date() : null;
    const status = completed ? 'COMPLETED' : 'UPCOMING';

    const [updated, activity] = await prisma.$transaction([
      prisma.followUp.update({
        where: { id },
        data: {
          completedAt,
          status,
        },
        include: {
          owner: true,
        },
      }),
      prisma.requestActivity.create({
        data: {
          requestId: followUp.requestId,
          actorId: actorId || null,
          type: completed ? 'FOLLOW_UP_COMPLETED' : 'NOTE_ADDED',
          message: completed
            ? `Follow-up completed: "${followUp.note}"`
            : `Follow-up re-opened: "${followUp.note}"`,
        },
      }),
    ]);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating follow-up:', error);
    return NextResponse.json(
      { error: 'Failed to update follow-up' },
      { status: 500 }
    );
  }
}
