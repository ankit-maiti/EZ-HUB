# EZ-HUB 🌿

> Lightweight internal operations hub built for **Lala Tech** to capture, track, assign, and follow up on client requests so that important work never gets lost across WhatsApp, email, and spreadsheets.

---

## 🎯 Overview

EZ-HUB acts as an operational safety net for client requests:
- **Fast Request Capture**: Log incoming requests from WhatsApp, Email, or calls in seconds.
- **Manager Triage Buckets**:
  - 📥 **Waiting for Us**: Active requests needing internal work.
  - ⏸️ **Waiting on Client**: Blocked externally (overdue timer safely paused).
  - 👤 **Unassigned**: Clear ownership queue for unallocated work.
  - 🚨 **Overdue Work**: Genuinely past-due internal deadlines.
- **Request Lifecycle State Machine**: `New Request` → `Needs Clarification` → `Ready to Assign` → `In Progress` → `Waiting on Client` / `Done`.
- **Follow-Up Management**: Track upcoming, due-today, and missed follow-up actions.
- **Chronological Audit Trail**: Full activity logging for status changes, assignments, notes, and client responses.
- **Role Switching**: Test Manager and Employee views instantly with the header switcher.
- **Aesthetic**: Styled with an **Earthen Brown** palette (roasted espresso, terracotta, warm clay, and sandstone neutrals).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & PostCSS (Custom Earthen Brown Design System)
- **Icons**: Lucide React
- **Database**: SQLite via Prisma ORM (relational schema, effortlessly swappable to PostgreSQL)
- **Utilities**: `date-fns`

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
Generate the Prisma client, push the schema to SQLite, and seed demo records:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3001) (or port 3001 if 3000 is occupied) in your browser.

---

## 📜 Documentation

- [PRD.md](./PRD.md) - Complete Product Requirements Document.
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System Architecture & Database Schema.
- [UX_FLOWS.md](./UX_FLOWS.md) - Detailed Operational Workflows & Scenarios.
