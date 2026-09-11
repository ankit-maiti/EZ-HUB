import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeIsOverdue, computeFollowUpStatus } from '@/lib/business-logic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const req = await prisma.request.findUnique({
      where: { id },
      include: {
        client: true,
        assignee: true,
        followUps: {
          orderBy: { scheduledAt: 'asc' },
          include: { owner: true },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: { actor: true },
        },
      },
    });

    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const now = new Date();
    const isOverdue = computeIsOverdue(req.status, req.dueAt, now);

    const followUps = req.followUps.map((f) => ({
      ...f,
      status: computeFollowUpStatus(f.scheduledAt, f.completedAt, now),
    }));

    return NextResponse.json({
      ...req,
      isOverdue,
      followUps,
    });
  } catch (error) {
    console.error('Error fetching request detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request detail' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, priority, dueAt, actorId } = body;

    const existing = await prisma.request.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (dueAt !== undefined) updateData.dueAt = dueAt ? new Date(dueAt) : null;

    if (priority && priority !== existing.priority) {
      updateData.priority = priority;
      await prisma.requestActivity.create({
        data: {
          requestId: id,
          actorId: actorId || null,
          type: 'PRIORITY_CHANGED',
          message: `Priority updated from ${existing.priority} to ${priority}`,
        },
      });
    }

    const updated = await prisma.request.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        assignee: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}
