export type UserRole = 'MANAGER' | 'EMPLOYEE';

export type RequestSource = 'WHATSAPP' | 'EMAIL' | 'OTHER';

export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type RequestStatus =
  | 'NEW'
  | 'NEEDS_CLARIFICATION'
  | 'READY_TO_ASSIGN'
  | 'IN_PROGRESS'
  | 'WAITING_ON_CLIENT'
  | 'DONE';

export type ActivityType =
  | 'CREATED'
  | 'STATUS_CHANGED'
  | 'ASSIGNED'
  | 'UNASSIGNED'
  | 'PRIORITY_CHANGED'
  | 'CLARIFICATION_REQUESTED'
  | 'CLIENT_RESPONSE'
  | 'FOLLOW_UP_CREATED'
  | 'FOLLOW_UP_COMPLETED'
  | 'NOTE_ADDED'
  | 'COMPLETED';

export type FollowUpStatus = 'UPCOMING' | 'DUE' | 'MISSED' | 'COMPLETED';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ClientItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface FollowUpItem {
  id: string;
  requestId: string;
  ownerId: string;
  owner: UserItem;
  scheduledAt: string | Date;
  note: string;
  status: FollowUpStatus;
  completedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface RequestActivityItem {
  id: string;
  requestId: string;
  actorId?: string | null;
  actor?: UserItem | null;
  type: ActivityType;
  message: string;
  metadata?: string | null;
  createdAt: string | Date;
}

export interface RequestItem {
  id: string;
  clientId: string;
  client: ClientItem;
  title: string;
  description: string;
  source: RequestSource;
  priority: RequestPriority;
  status: RequestStatus;
  assigneeId?: string | null;
  assignee?: UserItem | null;
  dueAt?: string | Date | null;
  waitingReason?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  activities?: RequestActivityItem[];
  followUps?: FollowUpItem[];
  // Derived fields
  isOverdue?: boolean;
  nextFollowUp?: FollowUpItem | null;
  lastActivity?: RequestActivityItem | null;
}

export interface TriageCounts {
  waitingForUs: number;
  waitingForClient: number;
  unassigned: number;
  overdue: number;
  totalActive: number;
}
