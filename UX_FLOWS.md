# EZ-HUB
## UX Flows

**Version:** 1.0  
**Purpose:** Define the operational interactions that the UI must support.

## 1. UX Philosophy

EZ-HUB is workflow-first, not dashboard-first.

The interface should help users move requests through:

**Capture → Clarify → Assign → Work → Follow Up → Resolve**

Avoid decorative screens and unnecessary navigation.

## 2. Flow: Capture New Request

**Entry:** Dashboard → New Request

User enters:
- Client
- Title
- Description
- Source
- Priority
- Optional due date
- Optional follow-up

System:
1. Validates required fields.
2. Creates request.
3. Creates `CREATED` activity.
4. Returns user to request detail or inbox.
5. Request appears immediately in the operational list.

Default status: `NEW`.

## 3. Flow: Clarify Request

**Entry:** Request detail

User determines more information is needed.

Action:
`NEW → NEEDS_CLARIFICATION`

System:
- Records status change.
- Prompts for clarification context.
- Preserves existing request information.
- Surfaces the request as internal work requiring attention.

## 4. Flow: Make Ready to Assign

When sufficient information exists:

`NEEDS_CLARIFICATION → READY_TO_ASSIGN`

System:
- Records status change.
- Keeps request unassigned until explicitly assigned.
- Makes it visible in the manager's unassigned/ready queue.

## 5. Flow: Assign Request

Manager opens a ready request.

Action:
- Select employee.
- Confirm assignment.

System:
- Updates assignee.
- Records `ASSIGNED` activity.
- Allows transition to `IN_PROGRESS`.

## 6. Flow: Start Work

Assigned employee opens request.

Action:
`READY_TO_ASSIGN → IN_PROGRESS`

System:
- Requires assignee.
- Records status change.
- Makes request part of active internal work.

## 7. Flow: Waiting on Client

While working, the employee determines client input is required.

User:
1. Selects `Waiting on Client`.
2. Enters what is being awaited.
3. Optionally records expected follow-up date.

System:
- Validates waiting context.
- Changes status.
- Preserves assignee.
- Records status change.
- Excludes request from overdue calculations while waiting.

## 8. Flow: Resume After Client Response

Client provides requested information.

User:
1. Opens request.
2. Records client response/context.
3. Changes status to `IN_PROGRESS`.

System:
- Records `CLIENT_RESPONSE`.
- Records status change.
- Re-enables normal internal overdue logic.

## 9. Flow: Create Follow-Up

User opens request and selects Add Follow-up.

Inputs:
- Owner
- Date/time
- Note

System:
- Creates follow-up tied to request.
- Records `FOLLOW_UP_CREATED`.
- Shows it on request detail and relevant operational views.

## 10. Flow: Complete Follow-Up

User opens due/missed follow-up.

Action:
`Complete`

System:
- Sets completion timestamp.
- Marks follow-up completed.
- Records `FOLLOW_UP_COMPLETED`.
- Removes it from missed/due views.

## 11. Flow: Complete Request

When work is complete:

`IN_PROGRESS → DONE`

System:
- Records completion activity.
- Removes request from active operational queues.
- Keeps request searchable and historically visible.

## 12. Flow: Manager Triage

Manager opens dashboard.

The page immediately presents actionable categories:

- Waiting for Us
- Waiting for Client
- Unassigned
- Overdue

Manager selects a category.

System:
- Applies corresponding filter.
- Shows relevant requests.
- Allows manager to open a request and act without navigating elsewhere.

## 13. Flow: Employee My Work

Employee opens My Work.

Show:
- Assigned active requests
- Priority
- Status
- Due date
- Follow-up state

Prioritize requests needing action.

## 14. Edge Cases

### Request has no due date
Never mark it overdue.

### Waiting on Client has expired due date
Do not mark overdue.

### Waiting on Client receives response
Return to In Progress and preserve history.

### In Progress has no assignee
Reject the transition.

### Follow-up passes without completion
Surface as missed.

### Completed request
Keep history, but remove from active work queues.

### Unassigned request
Show explicitly as unassigned, never imply ownership.

## 15. UI State Requirements

Every major view should support:

- Loading state
- Empty state
- Error state
- Success feedback after mutations
- Disabled/loading controls during mutations

Empty states should explain what the user can do next rather than merely saying "No data."

## 16. Interaction Principles

- Prefer inline status/assignment actions for common operations.
- Keep request context visible.
- Avoid modal chains for simple actions.
- Make destructive actions uncommon and confirmable.
- Make operational exceptions obvious.
- Use text labels alongside visual status indicators.
- Do not rely on color alone to communicate state.

## 17. Core Navigation

Keep navigation minimal:

- **Operations**
- **My Work**
- **Requests**
- Optional user/account controls

The primary landing view after authentication should be the operational workspace, not a marketing page.

## 18. Critical Demo Scenario

The MVP should be able to demonstrate this complete scenario:

1. Create a new WhatsApp request.
2. Move it to Needs Clarification.
3. Record clarification.
4. Move it to Ready to Assign.
5. Manager assigns employee.
6. Employee starts work.
7. Employee marks Waiting on Client and records what's needed.
8. Request remains visible as client-blocked, not overdue.
9. Record client response.
10. Resume In Progress.
11. Create follow-up.
12. Let follow-up become due/missed in demo data.
13. Complete follow-up.
14. Complete request.
15. Manager can review full history.

This scenario demonstrates the actual business problem and the complete operational loop.
