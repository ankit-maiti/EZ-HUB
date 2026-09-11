# EZ-HUB
## Product Requirements Document

**Version:** 1.0  
**Status:** MVP  
**Build Constraint:** 2-hour MVP  
**Product Type:** Internal Operations Tool

## 1. Product Overview

**Product Name:** EZ-HUB

**One-line Description:** EZ-HUB is a lightweight internal operations hub that helps Lala Tech capture, track, assign, and follow up on client requests so that important work does not get lost across WhatsApp, email, and spreadsheets.

**Product Vision:** Create a single operational source of truth for client requests without forcing Lala Tech to abandon the communication tools it already uses.

EZ-HUB should make it immediately obvious:
- What requests exist
- What needs clarification
- Who owns each request
- What is currently being worked on
- What is waiting on the client
- What needs follow-up
- What is genuinely overdue
- What has already happened

## 2. Problem Statement

Lala Tech currently manages operational requests across WhatsApp, email, spreadsheets, and manual processes.

A typical request follows this pattern:

**Client → WhatsApp/Email → Employee notices request → Request is interpreted → Employee assigned → Work happens → WhatsApp/Email communication → Spreadsheet updated**

This creates fragmentation.

### Primary problems
1. Client requests can be forgotten.
2. Follow-ups are especially likely to disappear inside conversations.
3. Managers do not have a live view of operational work.
4. Employees spend time searching conversations for context.
5. Employees and managers manually chase each other for updates.
6. Spreadsheet maintenance creates repetitive work.
7. Work waiting for the client can be confused with overdue internal work.

### Root Problem
> There is no single operational record that keeps a client request visible from initial capture through completion, including ownership, status, context, and next action.

## 3. Product North Star

> **No important client request or follow-up should disappear simply because it arrived through WhatsApp or email.**

Every active request should have:
- A current status
- A clear owner or an explicit unassigned state
- A priority
- Relevant context
- A next action or follow-up
- A visible history

## 4. Goals

### Primary goals
- Prevent requests from being forgotten.
- Prevent follow-ups from being forgotten.
- Give managers a live operational overview.
- Give employees enough context to act without searching multiple systems.
- Clearly distinguish internal work from client-blocked work.
- Reduce dependence on spreadsheets for active-work tracking.

### Secondary goals
- Make request assignment explicit.
- Make request history easy to understand.
- Reduce unnecessary internal status-chasing.
- Establish a foundation for future WhatsApp/email integrations.

## 5. Non-Goals

EZ-HUB MVP will NOT attempt to become:
- A CRM
- An ERP
- A full project management system
- A replacement for WhatsApp
- A replacement for email
- A customer-facing portal
- A full communication platform
- An advanced analytics platform
- An AI assistant
- A complex automation engine
- A notification-heavy enterprise system

## 6. Target Users

### Manager
Needs to:
- See everything requiring attention.
- Identify unassigned requests.
- Identify overdue internal work.
- Identify requests waiting for clients.
- Understand employee workload.
- Review request history.

### Employee / Operator
Needs to:
- See assigned work.
- Understand request context.
- Update status.
- Record important activity.
- Schedule follow-ups.
- Identify what needs action next.

## 7. Core Request Lifecycle

**New Request → Needs Clarification → Ready to Assign → In Progress → Waiting on Client → Done**

### Status Definitions
- **New Request:** Captured but not yet processed.
- **Needs Clarification:** Cannot confidently proceed because additional information is required.
- **Ready to Assign:** Sufficiently understood and ready for assignment.
- **In Progress:** Employee is actively responsible for completing it.
- **Waiting on Client:** Blocked because the client must provide information, approval, clarification, or another external dependency. This is not treated as overdue internal work.
- **Done:** Completed.

A request may return from **Waiting on Client → In Progress** when the client responds.

## 8. Status Transition Rules

Normal path:
**New Request → Needs Clarification → Ready to Assign → In Progress → Waiting on Client → In Progress → Done**

Sensible direct transitions may be allowed:
- New Request → Ready to Assign
- Ready to Assign → In Progress
- In Progress → Done

The UI should favor the normal workflow while allowing sensible exceptions.

When moving to **Waiting on Client**, capture enough context to explain what is being awaited.

## 9. Core MVP Features

### Request Creation
Manual request creation with:
- Client
- Request title
- Description
- Source
- Priority
- Status

Optional:
- Assignee
- Due date
- Follow-up date
- Context/reference

Source:
- WhatsApp
- Email
- Other

No direct WhatsApp/email API integration is required for the MVP.

### Request List
Expose:
- Request
- Client
- Priority
- Status
- Assignee
- Due date
- Next follow-up
- Last activity

Filters:
- Status
- Priority
- Assignee
- Client
- Source
- Overdue
- Follow-up state

### Request Detail
Show:
- Client
- Title
- Description
- Source
- Priority
- Status
- Assignee
- Due date
- Next follow-up
- Activity history

### Activity History
Record meaningful events:
- Request created
- Status changed
- Assignee changed
- Priority changed
- Clarification requested
- Client information received
- Follow-up created
- Follow-up completed
- Request completed

### Follow-Up Management
A follow-up contains:
- Request
- Owner
- Scheduled date/time
- Note
- Completion state

Distinguish:
- Upcoming
- Due
- Missed
- Completed

Missed follow-ups should be surfaced prominently.

### Manager Visibility
Manager view must show:
- Waiting for Us
- Waiting for Client
- Unassigned
- Overdue

The manager should be able to answer:
> **What needs my attention right now?**

## 10. Overdue Logic

A request is overdue when:
1. It has a due date.
2. The due date has passed.
3. It still requires internal action.
4. It is not Done.
5. It is not Waiting on Client.

Therefore:
- In Progress + due date passed = Overdue
- Needs Clarification + due date passed = Overdue
- Ready to Assign + due date passed = Overdue
- Waiting on Client + due date passed = **Not Overdue**

## 11. Follow-Up Logic

- **Upcoming:** scheduled in the future.
- **Due:** scheduled for the current date/time and incomplete.
- **Missed:** scheduled time has passed and incomplete.
- **Completed:** explicitly completed.

For the MVP, current-day incomplete follow-ups can be treated as Due and past-day incomplete follow-ups as Missed.

## 12. UX Principles

- Workflow first
- Information density over decoration
- Clear state
- Clear responsibility
- Clear next action
- Context at the point of work
- Minimal interaction cost

The product should be a working internal operations tool, not a marketing site.

Avoid:
- Decorative hero sections
- Excessive animations
- Huge KPI cards
- Fake analytics
- Decorative charts
- Unnecessary gradients
- Unnecessary AI features
- Excessive navigation
- Generic CRM conventions
- Dribbble-style UI

## 13. MVP Screens

1. **Operations Dashboard / Request Inbox**
   - Operational summary
   - Request list
   - Filters
   - Search
   - Quick actions

2. **Request Detail**
   - Request information
   - Status
   - Assignment
   - Due date
   - Follow-up
   - Activity history

3. **Create Request**
   - Fast request-entry form

4. **My Work**
   - Optional lightweight employee view of assigned requests

## 14. Roles and Permissions

### Manager
Can:
- View all requests
- Create requests
- Edit requests
- Assign requests
- Change status
- Change priority
- Set due dates
- Manage follow-ups
- View all activity

### Employee
Can:
- View assigned requests
- Create requests
- Update relevant information
- Change status of assigned requests
- Add activity
- Create/update follow-ups for assigned work

## 15. MVP Scope

### Must Have
- Manual request creation
- Request lifecycle
- Request list
- Request detail
- Assignment
- Priority
- Due dates
- Follow-ups
- Activity history
- Manager operational visibility
- Overdue logic
- Waiting-on-client logic
- Search/filtering

### Should Have
- Quick status actions
- Quick follow-up creation
- Employee My Work view
- Useful empty states

### Could Have
- Dashboard trend metrics
- Saved filters
- Bulk actions

### Out of Scope
- WhatsApp API integration
- Email ingestion
- Automated notifications
- Customer portal
- AI classification
- AI summaries
- Advanced analytics
- Mobile applications
- Complex workflow builder
- Custom roles
- Multi-tenant architecture

## 16. Success Metrics

Measure:
- Forgotten requests
- Missed follow-ups
- Unassigned requests
- Overdue internal requests
- Average time from request creation to assignment
- Average time from request creation to completion
- Manager time spent chasing updates
- Time spent searching for request context

Do not invent baseline values or fabricated improvement percentages.

## 17. Acceptance Criteria

- Users can create requests and immediately see them in the operational list.
- Requests can move through the defined lifecycle while retaining history.
- Managers can assign eligible requests.
- Requests can be marked Waiting on Client and are visibly separated from internal work.
- Past-due internal requests are marked overdue.
- Waiting on Client is not marked overdue solely because its due date has passed.
- Users can create and complete follow-ups.
- Missed follow-ups are visibly surfaced.
- Opening a request provides relevant history and context.
- Managers can quickly identify Waiting for Us, Waiting for Client, Unassigned, and Overdue work.
- The primary workflow can be completed without unnecessary screens.

## 18. Definition of Done

A user can:
1. Capture a client request.
2. Clarify it if necessary.
3. Make it ready for assignment.
4. Assign it.
5. Work on it.
6. Mark it Waiting on Client.
7. Resume work after client response.
8. Create and complete follow-ups.
9. Complete the request.
10. Review its history.
11. Identify overdue and unassigned work from the manager view.

**Product principle:** EZ-HUB is a practical safety net for client requests, not a generic task-management SaaS template wearing Lala Tech's logo.
