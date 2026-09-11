# EZ-HUB
## Technical Architecture

**Version:** 1.0  
**Status:** MVP  
**Target Build Time:** 2 hours

## 1. Architecture Goals

Prioritize:
1. Speed of implementation
2. Simplicity
3. Reliability
4. Maintainability
5. Clear business logic
6. Easy AI-assisted development
7. Easy local development
8. Simple deployment
9. Future integration capability

The MVP is one deployable application. Do not introduce microservices, message brokers, Kubernetes, or other infrastructure that does not materially improve the product.

## 2. Recommended Stack

### Frontend + Backend
**Next.js + TypeScript**

Use a single Next.js application for UI, server logic/API, authentication integration, and database access.

### UI
**React + Tailwind CSS**

Use a small reusable component system.

### Database
**PostgreSQL**

The domain is relational: Users, Clients, Requests, Activities, and Follow-ups.

### ORM
**Prisma**

Use Prisma for a typed data layer and rapid development.

### Authentication
Use a simple managed authentication solution compatible with the chosen deployment environment. Support Manager and Employee roles. Do not build custom authentication.

### Deployment
Use a simple managed platform for the Next.js app and managed PostgreSQL.

## 3. High-Level Architecture

```text
                    EZ-HUB
                      │
              ┌───────▼───────┐
              │    Next.js    │
              │ React + TS    │
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │ Application   │
              │ Business Logic│
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │  PostgreSQL   │
              └───────┬───────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
      Users         Clients       Requests
                                      │
                         ┌────────────┼────────────┐
                         ▼            ▼            ▼
                    Activities    Follow-ups    Assignment
```

External communication:
```text
WhatsApp ──┐
           ├── Manual capture ──→ EZ-HUB
Email ─────┘
```

Future integrations can connect to the request creation layer.

## 4. Core Domain Model

The **Request** is the central domain object.

```text
User
 │
 ├──────────────┐
 │              │
 ▼              ▼
Requests      Follow-ups
 │
 ├── Client
 └── Activities
```

## 5. Database Schema

### User
```text
User
- id
- name
- email
- role
- createdAt
- updatedAt
```

Roles:
- MANAGER
- EMPLOYEE

### Client
```text
Client
- id
- name
- email (optional)
- phone (optional)
- createdAt
- updatedAt
```

### Request
```text
Request
- id
- clientId
- title
- description
- source
- priority
- status
- assigneeId (nullable)
- dueAt (nullable)
- createdAt
- updatedAt
```

Source:
- WHATSAPP
- EMAIL
- OTHER

Priority:
- LOW
- MEDIUM
- HIGH
- URGENT

Status:
- NEW
- NEEDS_CLARIFICATION
- READY_TO_ASSIGN
- IN_PROGRESS
- WAITING_ON_CLIENT
- DONE

### RequestActivity
```text
RequestActivity
- id
- requestId
- actorId
- type
- message
- metadata (optional)
- createdAt
```

Types:
- CREATED
- STATUS_CHANGED
- ASSIGNED
- UNASSIGNED
- PRIORITY_CHANGED
- CLARIFICATION_REQUESTED
- CLIENT_RESPONSE
- FOLLOW_UP_CREATED
- FOLLOW_UP_COMPLETED
- NOTE_ADDED
- COMPLETED

### FollowUp
```text
FollowUp
- id
- requestId
- ownerId
- scheduledAt
- note
- status
- completedAt (nullable)
- createdAt
- updatedAt
```

Status:
- UPCOMING
- DUE
- MISSED
- COMPLETED

DUE/MISSED may be derived from time rather than permanently stored.

## 6. Relationships

```text
Client
  │
  └── 1:N Requests

User
  │
  ├── 1:N assigned Requests
  ├── 1:N FollowUps
  └── 1:N RequestActivities

Request
  │
  ├── N:1 Client
  ├── N:1 User (assignee)
  ├── 1:N RequestActivities
  └── 1:N FollowUps
```

## 7. Request State Machine

```text
NEW
 │
 ▼
NEEDS_CLARIFICATION
 │
 ▼
READY_TO_ASSIGN
 │
 ▼
IN_PROGRESS
 │
 ├───────────────┐
 │               │
 ▼               ▼
WAITING_ON_CLIENT DONE
 │
 ▼
IN_PROGRESS
```

Sensible direct transitions may be supported where required, but the normal workflow remains primary.

## 8. Business Logic

### Status Transition Validation

Transitions are validated server-side.

Normal transitions:
- NEW → NEEDS_CLARIFICATION
- NEEDS_CLARIFICATION → READY_TO_ASSIGN
- READY_TO_ASSIGN → IN_PROGRESS
- IN_PROGRESS → WAITING_ON_CLIENT
- IN_PROGRESS → DONE
- WAITING_ON_CLIENT → IN_PROGRESS

Reasonable direct transitions:
- NEW → READY_TO_ASSIGN
- READY_TO_ASSIGN → IN_PROGRESS

### Assignment Logic

- NEW: assignment not required.
- NEEDS_CLARIFICATION: assignment optional.
- READY_TO_ASSIGN: assignment expected.
- IN_PROGRESS: assignment required.
- WAITING_ON_CLIENT: retain existing assignee.
- DONE: retain historical assignee.

Backend must prevent IN_PROGRESS requests without an assignee.

## 9. Overdue Logic

Derive overdue instead of storing it as a permanent status.

```text
isOverdue =
    dueAt != null
    AND dueAt < currentTime
    AND status != DONE
    AND status != WAITING_ON_CLIENT
```

Therefore:

**WAITING_ON_CLIENT + expired dueAt = NOT OVERDUE**

When the request returns to IN_PROGRESS, the due date can make it overdue again if it remains past due.

## 10. Follow-Up Logic

Conceptually:

```text
completedAt != null
→ COMPLETED

scheduledAt > now
→ UPCOMING

scheduledAt <= now
AND not completed
→ DUE / MISSED
```

For the MVP:
- Current-day incomplete follow-ups = DUE
- Past-day incomplete follow-ups = MISSED

## 11. Activity Recording

Important mutations create activity records server-side.

Example:

```text
IN_PROGRESS
→ WAITING_ON_CLIENT
```

creates:

```text
type = STATUS_CHANGED
message = "Status changed from In Progress to Waiting on Client"
```

Activity history should be generated server-side so it cannot be accidentally skipped by frontend behavior.

## 12. API / Server Operations

Keep the API small.

### Requests
```text
GET    /api/requests
POST   /api/requests
GET    /api/requests/:id
PATCH  /api/requests/:id
```

### Status
```text
PATCH /api/requests/:id/status
```

### Assignment
```text
PATCH /api/requests/:id/assignee
```

### Activities
```text
GET  /api/requests/:id/activities
POST /api/requests/:id/activities
```

### Follow-ups
```text
GET   /api/requests/:id/followups
POST  /api/requests/:id/followups
PATCH /api/followups/:id
```

### Clients
```text
GET  /api/clients
POST /api/clients
```

Avoid endpoints for every tiny UI interaction if server actions or consolidated mutations are cleaner.

## 13. Frontend Structure

```text
app/
├── dashboard/
├── requests/
│   ├── page
│   ├── new/
│   └── [id]/
├── my-work/
└── api/

components/
├── requests/
├── dashboard/
├── followups/
├── activity/
└── ui/

lib/
├── db/
├── auth/
├── requests/
├── followups/
└── validation/
```

Keep business logic outside presentation components.

## 14. Main UI Components

### Operational Summary
Shows:
- Waiting for Us
- Waiting for Client
- Unassigned
- Overdue

These are actionable filters, not decorative KPI cards.

### Request Table/List
Shows:
- Request
- Client
- Priority
- Status
- Assignee
- Due date
- Follow-up
- Last activity

### Status Control
Allows permitted transitions.

### Assignee Control
Allows managers to assign/reassign requests.

### Follow-Up Panel
Allows creation/completion of follow-ups.

### Activity Timeline
Shows chronological operational history.

## 15. UX Architecture

Primary interaction:

```text
Dashboard
   ↓
Request List
   ↓
Request Detail
   ├── Update Status
   ├── Assign
   ├── Add Follow-up
   ├── Add Activity
   └── Complete
```

Request creation is accessible from the main work view.

Avoid forcing users through a landing page before reaching operations.

## 16. Authentication and Authorization

Roles:
- MANAGER
- EMPLOYEE

Manager:
- Access all requests and manager actions.

Employee:
- Access assigned requests and permitted operational actions.

Authorization must be enforced server-side.

## 17. Validation

### Request
Required:
- Client
- Title
- Description
- Source
- Priority
- Status

### In Progress
Requires:
- Assignee

### Waiting on Client
Should require:
- Context describing what is being awaited

### Follow-up
Requires:
- Owner
- Scheduled date/time

Validation must exist server-side.

## 18. Error Handling

Handle:
- Request creation failures
- Invalid status transitions
- Assignment failures
- Follow-up creation failures
- Unauthorized actions
- Missing/deleted requests

Errors should be actionable and should not silently lose user input.

## 19. Concurrency

No sophisticated distributed locking is needed.

Mutations should validate against current database state. UI should refresh/revalidate after mutations.

## 20. Search and Filtering

Search:
- Client
- Title
- Description

Filters:
- Status
- Priority
- Assignee
- Client
- Source
- Overdue
- Follow-up

Do not build full-text search infrastructure for the MVP.

## 21. Database Indexes

Useful indexes:
```text
Request.status
Request.assigneeId
Request.clientId
Request.dueAt
Request.createdAt

FollowUp.requestId
FollowUp.ownerId
FollowUp.scheduledAt
FollowUp.status
```

## 22. External Integrations

### MVP
No direct WhatsApp/email API integration. Users manually capture requests.

### Future
```text
WhatsApp / Email
       ↓
Integration Layer
       ↓
Request Creation Service
       ↓
EZ-HUB Request
```

The existing request lifecycle should remain unchanged.

## 23. Notifications

Do not build a notification platform for the MVP.

Surface:
- Missed follow-ups
- Overdue requests
- Unassigned requests
- Waiting-on-client requests

inside EZ-HUB.

Future versions can add email/WhatsApp notifications and escalations.

## 24. Security

Minimum requirements:
- Authenticated access
- Server-side authorization
- Input validation
- ORM/parameterized database queries
- Secure session handling
- Environment variables for secrets
- No secrets committed to source control

## 25. Deployment

### Local
```text
npm install
npm run dev
```

Use environment variables for database, auth, and application configuration.

### Production
```text
Next.js application
        +
Managed PostgreSQL
```

No custom infrastructure should be necessary.

## 26. Testing Strategy

Prioritize business-logic tests.

Critical tests:
- Valid/invalid state transitions
- Overdue logic
- Waiting-on-client logic
- Assignment requirements
- Follow-up states
- Manager/employee permissions

Examples:
- Past-due In Progress = overdue.
- Past-due Waiting on Client = not overdue.
- Done = not overdue.
- In Progress without assignee = rejected.

## 27. Future Architecture

Keep the system extensible toward:
- WhatsApp ingestion
- Email ingestion
- Automatic request extraction
- Notifications
- Escalations
- Reporting
- Analytics
- Client portal
- Advanced workflow automation

Do not allow future complexity to infect the MVP.

## 28. Architecture Principles

### Keep the request central.
Request is the core domain object.

### Keep state explicit.
Do not hide operational state in UI logic.

### Keep business rules server-side.
Frontend presents rules; backend enforces them.

### Derive operational indicators.
Overdue and follow-up states should be derived from authoritative data where practical.

### Preserve history.
Important actions create immutable activity records.

### Prefer simple infrastructure.
One application and one database are sufficient.

### Build for the current problem.
Future integrations should not complicate the current MVP.

## 29. Definition of Done

- Every PRD feature has a technical implementation path.
- Request lifecycle is explicitly represented.
- Status transitions are validated.
- Waiting-on-client logic is distinct from overdue logic.
- Follow-ups are represented in the data model.
- Activity history is persisted.
- Manager operational categories can be queried efficiently.
- Authentication and authorization are defined.
- MVP runs as one deployable application.
- WhatsApp/email integrations remain optional future additions.
- No unnecessary distributed architecture exists.
