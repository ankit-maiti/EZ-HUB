import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidStatusTransition } from '@/lib/business-logic';
import { RequestStatus } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      status: targetStatus,
      actorId,
      reason,
      clientResponseNote,
    } = body as {
      status: RequestStatus;
      actorId?: string;
      reason?: string;
      clientResponseNote?: string;
    };

    const current = await prisma.request.findUnique({
      where: { id },
      include: { assignee: true },
    });

    if (!current) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const currentStatus = current.status as RequestStatus;

    // Check transition validity
    const validation = isValidStatusTransition(
      currentStatus,
      targetStatus,
      Boolean(current.assigneeId)
    );

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // If moving to WAITING_ON_CLIENT, require waiting context
    if (targetStatus === 'WAITING_ON_CLIENT' && (!reason || !reason.trim())) {
      return NextResponse.json(
        { error: 'Context describing what is being awaited from the client is required.' },
        { status: 400 }
      );
    }

    // Determine activity details
    let activityType = 'STATUS_CHANGED';
    let activityMessage = `Status changed from ${currentStatus.replace(/_/g, ' ')} to ${targetStatus.replace(/_/g, ' ')}`;

    if (targetStatus === 'WAITING_ON_CLIENT') {
      activityMessage = `Marked Waiting on Client: ${reason?.trim()}`;
    } else if (currentStatus === 'WAITING_ON_CLIENT' && targetStatus === 'IN_PROGRESS') {
      activityType = 'CLIENT_RESPONSE';
      activityMessage = clientResponseNote?.trim()
        ? `Resumed In Progress after client response: ${clientResponseNote.trim()}`
        : 'Resumed In Progress after client responded';
    } else if (targetStatus === 'NEEDS_CLARIFICATION' && reason) {
      activityType = 'CLARIFICATION_REQUESTED';
      activityMessage = `Needs Clarification: ${reason.trim()}`;
    } else if (targetStatus === 'DONE') {
      activityType = 'COMPLETED';
      activityMessage = reason?.trim()
        ? `Request completed: ${reason.trim()}`
        : 'Request marked completed';
    }

    // Perform update in transaction
    const [updatedRequest, activity] = await prisma.$transaction([
      prisma.request.update({
        where: { id },
        data: {
          status: targetStatus,
          waitingReason: targetStatus === 'WAITING_ON_CLIENT' ? reason?.trim() : null,
        },
        include: {
          client: true,
          assignee: true,
        },
      }),
      prisma.requestActivity.create({
        data: {
          requestId: id,
          actorId: actorId || null,
          type: activityType,
          message: activityMessage,
        },
      }),
    ]);

    return NextResponse.json({
      request: updatedRequest,
      activity,
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    return NextResponse.json(
      { error: 'Failed to update request status' },
      { status: 500 }
    );
  }
}
