import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeIsOverdue, computeFollowUpStatus } from '@/lib/business-logic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const assigneeId = searchParams.get('assigneeId') || '';
    const clientId = searchParams.get('clientId') || '';
    const source = searchParams.get('source') || '';
    const triage = searchParams.get('triage') || '';

    // Fetch all requests with related data to compute derived properties and triage counts
    const allRequests = await prisma.request.findMany({
      include: {
        client: true,
        assignee: true,
        followUps: {
          orderBy: { scheduledAt: 'asc' },
          include: { owner: true },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { actor: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    // Compute derived properties for each request
    const enriched = allRequests.map((r) => {
      const isOverdue = computeIsOverdue(r.status, r.dueAt, now);

      // Find earliest incomplete follow-up
      const pendingFollowUps = r.followUps
        .filter((f) => !f.completedAt)
        .map((f) => ({
          ...f,
          status: computeFollowUpStatus(f.scheduledAt, f.completedAt, now),
        }));

      const nextFollowUp = pendingFollowUps[0] || null;
      const lastActivity = r.activities[0] || null;

      return {
        ...r,
        isOverdue,
        nextFollowUp,
        lastActivity,
      };
    });

    // Calculate Triage counts
    const triageCounts = {
      waitingForUs: enriched.filter((r) => r.status !== 'DONE' && r.status !== 'WAITING_ON_CLIENT').length,
      waitingForClient: enriched.filter((r) => r.status === 'WAITING_ON_CLIENT').length,
      unassigned: enriched.filter((r) => !r.assigneeId && r.status !== 'DONE').length,
      overdue: enriched.filter((r) => r.isOverdue).length,
      totalActive: enriched.filter((r) => r.status !== 'DONE').length,
    };

    // Filter based on parameters
    let filtered = enriched;

    if (triage === 'waiting_for_us') {
      filtered = filtered.filter((r) => r.status !== 'DONE' && r.status !== 'WAITING_ON_CLIENT');
    } else if (triage === 'waiting_for_client') {
      filtered = filtered.filter((r) => r.status === 'WAITING_ON_CLIENT');
    } else if (triage === 'unassigned') {
      filtered = filtered.filter((r) => !r.assigneeId && r.status !== 'DONE');
    } else if (triage === 'overdue') {
      filtered = filtered.filter((r) => r.isOverdue);
    }

    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(lower) ||
          r.description.toLowerCase().includes(lower) ||
          r.client.name.toLowerCase().includes(lower) ||
          r.id.toLowerCase().includes(lower)
      );
    }

    if (status && status !== 'ALL') {
      filtered = filtered.filter((r) => r.status === status);
    }

    if (priority && priority !== 'ALL') {
      filtered = filtered.filter((r) => r.priority === priority);
    }

    if (source && source !== 'ALL') {
      filtered = filtered.filter((r) => r.source === source);
    }

    if (clientId && clientId !== 'ALL') {
      filtered = filtered.filter((r) => r.clientId === clientId);
    }

    if (assigneeId && assigneeId !== 'ALL') {
      if (assigneeId === 'UNASSIGNED') {
        filtered = filtered.filter((r) => !r.assigneeId);
      } else {
        filtered = filtered.filter((r) => r.assigneeId === assigneeId);
      }
    }

    return NextResponse.json({
      requests: filtered,
      triageCounts,
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientId,
      clientName,
      title,
      description,
      source,
      priority,
      dueAt,
      actorId,
      assigneeId,
      initialFollowUpNote,
      initialFollowUpDate,
    } = body;

    if (!title || !description || !source || !priority) {
      return NextResponse.json(
        { error: 'Title, description, source, and priority are required.' },
        { status: 400 }
      );
    }

    let finalClientId = clientId;

    // Support creating new client on the fly if clientName is provided
    if (!finalClientId && clientName) {
      const newClient = await prisma.client.create({
        data: { name: clientName.trim() },
      });
      finalClientId = newClient.id;
    }

    if (!finalClientId) {
      return NextResponse.json(
        { error: 'Client selection or name is required.' },
        { status: 400 }
      );
    }

    // Default status is NEW
    const initialStatus = assigneeId ? 'READY_TO_ASSIGN' : 'NEW';

    const newRequest = await prisma.request.create({
      data: {
        clientId: finalClientId,
        title: title.trim(),
        description: description.trim(),
        source,
        priority,
        status: initialStatus,
        assigneeId: assigneeId || null,
        dueAt: dueAt ? new Date(dueAt) : null,
      },
      include: {
        client: true,
        assignee: true,
      },
    });

    // Create server-side CREATED activity record
    let actorName = 'Operations';
    if (actorId) {
      const actor = await prisma.user.findUnique({ where: { id: actorId } });
      if (actor) actorName = actor.name;
    }

    await prisma.requestActivity.create({
      data: {
        requestId: newRequest.id,
        actorId: actorId || null,
        type: 'CREATED',
        message: `Request created via ${source} by ${actorName}`,
      },
    });

    if (assigneeId) {
      await prisma.requestActivity.create({
        data: {
          requestId: newRequest.id,
          actorId: actorId || null,
          type: 'ASSIGNED',
          message: `Assigned to ${newRequest.assignee?.name || 'team member'}`,
        },
      });
    }

    // If initial follow-up specified
    if (initialFollowUpNote && initialFollowUpDate) {
      const followUpOwnerId = assigneeId || actorId;
      if (followUpOwnerId) {
        await prisma.followUp.create({
          data: {
            requestId: newRequest.id,
            ownerId: followUpOwnerId,
            scheduledAt: new Date(initialFollowUpDate),
            note: initialFollowUpNote.trim(),
            status: 'UPCOMING',
          },
        });

        await prisma.requestActivity.create({
          data: {
            requestId: newRequest.id,
            actorId: actorId || null,
            type: 'FOLLOW_UP_CREATED',
            message: `Follow-up scheduled: "${initialFollowUpNote.trim()}"`,
          },
        });
      }
    }

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}
