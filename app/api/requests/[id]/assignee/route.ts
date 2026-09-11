import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { assigneeId, actorId } = body;

    const current = await prisma.request.findUnique({
      where: { id },
      include: { assignee: true },
    });

    if (!current) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    let activityMessage = '';
    let activityType = 'ASSIGNED';

    if (!assigneeId) {
      // Unassigning
      if (current.status === 'IN_PROGRESS') {
        return NextResponse.json(
          { error: 'Cannot unassign a request that is currently In Progress. Change status first.' },
          { status: 400 }
        );
      }
      activityType = 'UNASSIGNED';
      activityMessage = `Unassigned from ${current.assignee?.name || 'previous owner'}`;
    } else {
      const newAssignee = await prisma.user.findUnique({
        where: { id: assigneeId },
      });
      if (!newAssignee) {
        return NextResponse.json({ error: 'Assignee not found' }, { status: 404 });
      }
      activityType = 'ASSIGNED';
      activityMessage = current.assignee
        ? `Reassigned from ${current.assignee.name} to ${newAssignee.name}`
        : `Assigned to ${newAssignee.name}`;
    }

    const [updatedRequest, activity] = await prisma.$transaction([
      prisma.request.update({
        where: { id },
        data: {
          assigneeId: assigneeId || null,
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
    console.error('Error updating assignee:', error);
    return NextResponse.json(
      { error: 'Failed to update assignee' },
      { status: 500 }
    );
  }
}
