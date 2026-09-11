import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeFollowUpStatus } from '@/lib/business-logic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { ownerId, scheduledAt, note, actorId } = body;

    if (!ownerId || !scheduledAt || !note || !note.trim()) {
      return NextResponse.json(
        { error: 'Owner, scheduled date/time, and note are required.' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledAt);
    const initialStatus = computeFollowUpStatus(scheduledDate, null);

    const [followUp, activity] = await prisma.$transaction([
      prisma.followUp.create({
        data: {
          requestId: id,
          ownerId,
          scheduledAt: scheduledDate,
          note: note.trim(),
          status: initialStatus,
        },
        include: {
          owner: true,
        },
      }),
      prisma.requestActivity.create({
        data: {
          requestId: id,
          actorId: actorId || null,
          type: 'FOLLOW_UP_CREATED',
          message: `Follow-up created for ${scheduledDate.toLocaleDateString()}: "${note.trim()}"`,
        },
      }),
    ]);

    return NextResponse.json(followUp, { status: 201 });
  } catch (error) {
    console.error('Error creating follow-up:', error);
    return NextResponse.json(
      { error: 'Failed to create follow-up' },
      { status: 500 }
    );
  }
}
