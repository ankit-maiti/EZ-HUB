import { FollowUpStatus, RequestItem, RequestStatus, FollowUpItem } from './types';
import { isBefore, isToday, startOfDay } from 'date-fns';

/**
 * Calculates whether a request is overdue according to Section 10 of PRD:
 * 1. Has a due date
 * 2. Due date has passed
 * 3. Still requires internal action
 * 4. Is not Done
 * 5. Is not Waiting on Client
 *
 * CRITICAL RULE:
 * WAITING_ON_CLIENT + expired dueAt = NOT OVERDUE!
 */
export function computeIsOverdue(
  status: string,
  dueAt: string | Date | null | undefined,
  now: Date = new Date()
): boolean {
  if (!dueAt) return false;
  if (status === 'DONE') return false;
  if (status === 'WAITING_ON_CLIENT') return false;

  const dueDate = new Date(dueAt);
  return isBefore(dueDate, now);
}

/**
 * Derives follow-up status based on scheduled date and completion timestamp:
 * - COMPLETED if completedAt is present
 * - UPCOMING if scheduled in the future (after today)
 * - DUE if scheduled today and incomplete
 * - MISSED if scheduled before today and incomplete
 */
export function computeFollowUpStatus(
  scheduledAt: string | Date,
  completedAt: string | Date | null | undefined,
  now: Date = new Date()
): FollowUpStatus {
  if (completedAt) return 'COMPLETED';

  const scheduled = new Date(scheduledAt);
  const todayStart = startOfDay(now);

  if (isBefore(scheduled, todayStart)) {
    return 'MISSED';
  }

  if (isToday(scheduled)) {
    return 'DUE';
  }

  return 'UPCOMING';
}

/**
 * Permitted status transitions validator:
 * Checks whether fromStatus -> toStatus is valid according to state machine
 */
export function isValidStatusTransition(
  fromStatus: RequestStatus,
  toStatus: RequestStatus,
  hasAssignee: boolean
): { valid: boolean; error?: string } {
  if (fromStatus === toStatus) {
    return { valid: true };
  }

  // To enter IN_PROGRESS, an assignee is strictly required
  if (toStatus === 'IN_PROGRESS' && !hasAssignee) {
    return {
      valid: false,
      error: 'Cannot move to In Progress without an assigned team member.',
    };
  }

  const allowedTransitions: Record<RequestStatus, RequestStatus[]> = {
    NEW: ['NEEDS_CLARIFICATION', 'READY_TO_ASSIGN', 'IN_PROGRESS', 'DONE'],
    NEEDS_CLARIFICATION: ['READY_TO_ASSIGN', 'IN_PROGRESS', 'DONE'],
    READY_TO_ASSIGN: ['IN_PROGRESS', 'NEEDS_CLARIFICATION', 'DONE'],
    IN_PROGRESS: ['WAITING_ON_CLIENT', 'DONE', 'NEEDS_CLARIFICATION', 'READY_TO_ASSIGN'],
    WAITING_ON_CLIENT: ['IN_PROGRESS', 'DONE'],
    DONE: ['IN_PROGRESS', 'READY_TO_ASSIGN'], // Allow reopening if client re-engages
  };

  const allowed = allowedTransitions[fromStatus] || [];
  if (!allowed.includes(toStatus)) {
    return {
      valid: false,
      error: `Transition from ${fromStatus} to ${toStatus} is not permitted.`,
    };
  }

  return { valid: true };
}

/**
 * Categorizes active requests into Manager Triage buckets:
 * 1. Waiting for Us (Internal work needing attention: NEW, NEEDS_CLARIFICATION, READY_TO_ASSIGN, IN_PROGRESS)
 * 2. Waiting for Client (WAITING_ON_CLIENT)
 * 3. Unassigned (assigneeId is null and status != DONE)
 * 4. Overdue (isOverdue == true)
 */
export function categorizeRequest(req: {
  status: string;
  assigneeId?: string | null;
  dueAt?: string | Date | null;
}) {
  const isOverdue = computeIsOverdue(req.status, req.dueAt);
  const isWaitingOnClient = req.status === 'WAITING_ON_CLIENT';
  const isDone = req.status === 'DONE';
  const isUnassigned = !req.assigneeId && !isDone;
  const isWaitingForUs = !isDone && !isWaitingOnClient;

  return {
    isWaitingForUs,
    isWaitingOnClient,
    isUnassigned,
    isOverdue,
    isDone,
  };
}
