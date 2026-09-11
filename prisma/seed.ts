import { PrismaClient } from '@prisma/client';
import { addDays, subDays, addHours, subHours } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing database records...');
  await prisma.followUp.deleteMany({});
  await prisma.requestActivity.deleteMany({});
  await prisma.request.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Creating users...');
  const manager = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya.sharma@lalatech.internal',
      role: 'MANAGER',
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      name: 'Aman Patel',
      email: 'aman.patel@lalatech.internal',
      role: 'EMPLOYEE',
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      name: 'Rohan Mehta',
      email: 'rohan.mehta@lalatech.internal',
      role: 'EMPLOYEE',
    },
  });

  const employee3 = await prisma.user.create({
    data: {
      name: 'Sneha Rao',
      email: 'sneha.rao@lalatech.internal',
      role: 'EMPLOYEE',
    },
  });

  console.log('Creating clients...');
  const clientAcme = await prisma.client.create({
    data: {
      name: 'Acme Retail Ltd.',
      email: 'ops@acmeretail.com',
      phone: '+91 98200 12345',
    },
  });

  const clientGlobal = await prisma.client.create({
    data: {
      name: 'Global Logistics Hub',
      email: 'shipments@globallogistics.io',
      phone: '+91 98450 67890',
    },
  });

  const clientNova = await prisma.client.create({
    data: {
      name: 'Nova Diagnostics & Labs',
      email: 'reports@novadiag.com',
      phone: '+91 99100 54321',
    },
  });

  const clientZenith = await prisma.client.create({
    data: {
      name: 'Zenith Organic Foods',
      email: 'procurement@zenithfoods.in',
      phone: '+91 97110 99887',
    },
  });

  console.log('Creating sample operational requests & scenarios...');

  // 1. WhatsApp request from Acme: Waiting on Client (with EXPIRED due date to prove it is NOT overdue)
  const reqWaitingOnClient = await prisma.request.create({
    data: {
      clientId: clientAcme.id,
      title: 'POS API webhook failing on batch payload sync',
      description: 'Acme reported sporadic timeout errors on WhatsApp when submitting high-volume evening batches. We identified schema mismatch in their JSON header and requested their updated server payload specification.',
      source: 'WHATSAPP',
      priority: 'HIGH',
      status: 'WAITING_ON_CLIENT',
      assigneeId: employee1.id,
      dueAt: subDays(new Date(), 2), // Past due, but NOT overdue because it is waiting on client!
      waitingReason: 'Awaiting Acme technical team to provide the updated sample JSON payload and auth bearer token.',
      createdAt: subDays(new Date(), 5),
    },
  });

  await prisma.requestActivity.createMany({
    data: [
      {
        requestId: reqWaitingOnClient.id,
        actorId: manager.id,
        type: 'CREATED',
        message: 'Request captured from WhatsApp chat by Priya Sharma',
        createdAt: subDays(new Date(), 5),
      },
      {
        requestId: reqWaitingOnClient.id,
        actorId: manager.id,
        type: 'ASSIGNED',
        message: 'Assigned to Aman Patel by Priya Sharma',
        createdAt: subDays(new Date(), 4),
      },
      {
        requestId: reqWaitingOnClient.id,
        actorId: employee1.id,
        type: 'STATUS_CHANGED',
        message: 'Status changed from Ready to Assign to In Progress',
        createdAt: subDays(new Date(), 4),
      },
      {
        requestId: reqWaitingOnClient.id,
        actorId: employee1.id,
        type: 'STATUS_CHANGED',
        message: 'Status changed to Waiting on Client: Awaiting Acme technical team to provide the updated sample JSON payload and auth bearer token.',
        createdAt: subDays(new Date(), 3),
      },
    ],
  });

  await prisma.followUp.create({
    data: {
      requestId: reqWaitingOnClient.id,
      ownerId: employee1.id,
      scheduledAt: addDays(new Date(), 1),
      note: 'Follow up with Rajesh at Acme if payload spec not received by tomorrow noon',
      status: 'UPCOMING',
    },
  });

  // 2. Overdue Internal Request (In Progress, due date passed -> genuinely Overdue)
  const reqOverdue = await prisma.request.create({
    data: {
      clientId: clientGlobal.id,
      title: 'End-of-month reconciliation discrepancies in dispatch report',
      description: 'Received urgent email regarding $14,000 discrepancy between warehouse barcode scan records and export invoice records. Requires manual cross-check across ledger entries.',
      source: 'EMAIL',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      assigneeId: employee2.id,
      dueAt: subDays(new Date(), 1), // Yesterday -> genuinely overdue!
      createdAt: subDays(new Date(), 4),
    },
  });

  await prisma.requestActivity.createMany({
    data: [
      {
        requestId: reqOverdue.id,
        actorId: manager.id,
        type: 'CREATED',
        message: 'Urgent email ticket captured from shipments@globallogistics.io',
        createdAt: subDays(new Date(), 4),
      },
      {
        requestId: reqOverdue.id,
        actorId: manager.id,
        type: 'ASSIGNED',
        message: 'Assigned to Rohan Mehta',
        createdAt: subDays(new Date(), 3),
      },
      {
        requestId: reqOverdue.id,
        actorId: employee2.id,
        type: 'STATUS_CHANGED',
        message: 'Status changed to In Progress',
        createdAt: subDays(new Date(), 3),
      },
      {
        requestId: reqOverdue.id,
        actorId: employee2.id,
        type: 'NOTE_ADDED',
        message: 'Extracted first 400 shipment rows; found 12 unlinked waybills needing confirmation.',
        createdAt: subDays(new Date(), 2),
      },
    ],
  });

  // Follow-up on overdue ticket that is MISSED (scheduled yesterday)
  await prisma.followUp.create({
    data: {
      requestId: reqOverdue.id,
      ownerId: employee2.id,
      scheduledAt: subDays(new Date(), 1),
      note: 'Provide partial ledger summary to client CFO',
      status: 'MISSED',
    },
  });

  // 3. Unassigned New Request from WhatsApp needing clarification
  const reqNeedsClarification = await prisma.request.create({
    data: {
      clientId: clientNova.id,
      title: 'Request for custom branch telemetry data export',
      description: 'Voice note received on Lala Tech support WhatsApp: "Need patient telemetry reports formatted for the state accreditation audit by Friday." Missing which test modalities or branch locations should be included.',
      source: 'WHATSAPP',
      priority: 'MEDIUM',
      status: 'NEEDS_CLARIFICATION',
      assigneeId: null, // Unassigned!
      dueAt: addDays(new Date(), 2),
      createdAt: subHours(new Date(), 10),
    },
  });

  await prisma.requestActivity.createMany({
    data: [
      {
        requestId: reqNeedsClarification.id,
        actorId: manager.id,
        type: 'CREATED',
        message: 'Logged from WhatsApp voice memo by Priya Sharma',
        createdAt: subHours(new Date(), 10),
      },
      {
        requestId: reqNeedsClarification.id,
        actorId: manager.id,
        type: 'CLARIFICATION_REQUESTED',
        message: 'Needs Clarification: Need client to confirm whether MRI/CT records are required or only pathology blood work.',
        createdAt: subHours(new Date(), 9),
      },
    ],
  });

  // 4. Ready to Assign request (Unassigned, clear scope)
  const reqReadyToAssign = await prisma.request.create({
    data: {
      clientId: clientZenith.id,
      title: 'Bulk product catalog onboarding: 250 organic SKUs',
      description: 'Zenith provided full spreadsheet with barcode, nutritional facts, and vendor IDs. Specification verified and ready for database import pipeline run.',
      source: 'EMAIL',
      priority: 'HIGH',
      status: 'READY_TO_ASSIGN',
      assigneeId: null, // Unassigned!
      dueAt: addDays(new Date(), 3),
      createdAt: subHours(new Date(), 5),
    },
  });

  await prisma.requestActivity.createMany({
    data: [
      {
        requestId: reqReadyToAssign.id,
        actorId: manager.id,
        type: 'CREATED',
        message: 'Request logged from procurement email',
        createdAt: subHours(new Date(), 5),
      },
      {
        requestId: reqReadyToAssign.id,
        actorId: manager.id,
        type: 'STATUS_CHANGED',
        message: 'Clarified columns and moved to Ready to Assign',
        createdAt: subHours(new Date(), 4),
      },
    ],
  });

  // 5. In Progress with Follow-up DUE TODAY
  const reqInProgressDueToday = await prisma.request.create({
    data: {
      clientId: clientAcme.id,
      title: 'Quarterly compliance certificate renewal and SSL rotation',
      description: 'Renewal of staging SSL certs and TLS 1.3 cipher suite upgrade on the Lala Tech proxy gateways.',
      source: 'OTHER',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      assigneeId: employee1.id,
      dueAt: addDays(new Date(), 1),
      createdAt: subDays(new Date(), 2),
    },
  });

  await prisma.requestActivity.createMany({
    data: [
      {
        requestId: reqInProgressDueToday.id,
        actorId: manager.id,
        type: 'CREATED',
        message: 'Ticket created by Priya Sharma',
        createdAt: subDays(new Date(), 2),
      },
      {
        requestId: reqInProgressDueToday.id,
        actorId: manager.id,
        type: 'ASSIGNED',
        message: 'Assigned to Aman Patel',
        createdAt: subDays(new Date(), 2),
      },
      {
        requestId: reqInProgressDueToday.id,
        actorId: employee1.id,
        type: 'STATUS_CHANGED',
        message: 'Status changed to In Progress',
        createdAt: subDays(new Date(), 1),
      },
    ],
  });

  await prisma.followUp.create({
    data: {
      requestId: reqInProgressDueToday.id,
      ownerId: employee1.id,
      scheduledAt: new Date(), // Today!
      note: 'Verify certificate revocation list ping test with Acme infrastructure team',
      status: 'DUE',
    },
  });

  // 6. Completed Request with full history
  const reqDone = await prisma.request.create({
    data: {
      clientId: clientNova.id,
      title: 'Emergency roll-forward of lab printer print spooler',
      description: 'Nova hospital lab printers stalled on print queues. Applied driver patch v4.2.1 and cleared spooler cache.',
      source: 'WHATSAPP',
      priority: 'URGENT',
      status: 'DONE',
      assigneeId: employee3.id,
      dueAt: subDays(new Date(), 3),
      createdAt: subDays(new Date(), 6),
    },
  });

  await prisma.requestActivity.createMany({
    data: [
      {
        requestId: reqDone.id,
        actorId: manager.id,
        type: 'CREATED',
        message: 'Urgent WhatsApp alert logged from Nova emergency desk',
        createdAt: subDays(new Date(), 6),
      },
      {
        requestId: reqDone.id,
        actorId: manager.id,
        type: 'ASSIGNED',
        message: 'Assigned to Sneha Rao',
        createdAt: subDays(new Date(), 6),
      },
      {
        requestId: reqDone.id,
        actorId: employee3.id,
        type: 'STATUS_CHANGED',
        message: 'Status changed to In Progress',
        createdAt: subDays(new Date(), 6),
      },
      {
        requestId: reqDone.id,
        actorId: employee3.id,
        type: 'NOTE_ADDED',
        message: 'Connected via secure SSH tunnel; rebooted daemon and reapplied print template.',
        createdAt: subDays(new Date(), 5),
      },
      {
        requestId: reqDone.id,
        actorId: employee3.id,
        type: 'COMPLETED',
        message: 'Issue resolved and verified with Nova lab technicians. Marked Done.',
        createdAt: subDays(new Date(), 4),
      },
    ],
  });

  await prisma.followUp.create({
    data: {
      requestId: reqDone.id,
      ownerId: employee3.id,
      scheduledAt: subDays(new Date(), 4),
      note: 'Call Nova desk to verify night shift had no print interruptions',
      status: 'COMPLETED',
      completedAt: subDays(new Date(), 4),
    },
  });

  console.log('Database seeded successfully with Lala Tech operations data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
