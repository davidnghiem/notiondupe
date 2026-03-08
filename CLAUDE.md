# MWAH Project Hub — Build Spec

Custom project management tool for the MWAH CRM team. Fork of github.com/davidnghiem/kanban, extended into a 5-tab project management hub.

**Purpose:** Replace Notion for bug tracking, roadmapping, and Claude-to-Claude coordination. Both AI agents (Claudes) and humans use it — Claudes via REST API, humans via UI.

---

## Source Project

**Repo to fork:** https://github.com/davidnghiem/kanban
**Live:** https://kanban-nine-smoky.vercel.app/
**Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + PostgreSQL (Neon serverless) + Drizzle ORM
**Existing:** Kanban board with drag-and-drop (@dnd-kit), REST API for tasks/columns, dark mode

### Existing Schema (in `lib/schema.ts`)
- `columns` — id, name, position, createdAt
- `tasks` — id, title, description, columnId, position, notes, createdAt, updatedAt

### Existing API
- `GET/POST /api/board` — full board view
- `GET/POST /api/columns`, `GET/PATCH/DELETE /api/columns/[id]`
- `GET/POST /api/tasks`, `GET/PATCH/DELETE /api/tasks/[id]`
- `POST /api/seed` — initialize default columns

---

## What to Build — 5 Tabs

### Tab 1: Kanban Board (enhance existing)
- **Priority levels:** P0 (Critical/red), P1 (High/orange), P2 (Medium/yellow), P3 (Low/gray) — color-coded badges on cards
- **Labels/tags:** Component labels (Orders, Email, Calendar, Dashboard, Store Detail, Admin, Map, etc.) — pill badges
- **Assignees:** Simple string field — "Kyle's Claude", "Nghiem's Claude", "Kyle", "Nghiem" — avatar/name on card
- **Due dates:** Date picker, shown on card, highlight overdue in red
- **Multiple boards:** Board selector dropdown. Each board has its own columns + tasks. Default board ID = 1 for backward compat.

### Tab 2: Issue Tracker (new)
Table/list view for bugs and issues:
- **Fields:** title, description, priority (P0-P3), status, component, assignee, reporter, versionFound, versionFixed, stepsToReproduce, timestamps
- **Statuses:** Backlog → Triaged → In Progress → Fixed → Closed → Won't Fix
- **Views:** Filterable table with column sorting, search bar (searches title + description)
- **Interaction:** Click row to expand full issue detail (modal). Quick-action buttons for status change, assign, set priority.
- **Filter bar:** Priority dropdown, status dropdown, component dropdown, assignee dropdown, search text

### Tab 3: Roadmap (new)
Timeline view for planning features and projects:
- **Fields:** title, description, phase, status, assignees (array), startDate, targetDate, dependencies (array of item IDs), sortOrder, owner, estimate, attachments, timestamps
- **Phases:** Immediate / Short-term / Medium-term / Long-term — color-coded (red/orange/blue/gray)
- **Statuses:** Backlog / Mockup Needed / Approved / In Progress / Done
- **Owner:** Single person responsible for the item
- **Estimate:** Freeform text (e.g. "2 weeks", "1 sprint")
- **Assignees:** Multi-select from the team list (people + Claudes)
- **Timeline view:** Cards grouped/swimlaned by phase with colored borders and headers. Items show owner avatars and estimate badges.
- **Dependencies:** Shown as "Blocked by #X" text on cards
- **Filter bar:** Notion-style multi-select for phase, status, owner

### Tab 4: Activity Feed (new)
Append-only shared timeline:
- **Fields:** actor (who), action (what — text), context (optional JSON link to task/issue/decision), metadata (optional JSON), createdAt
- **Append-only:** No edit, no delete. Activity log is immutable.
- **Use case:** Both Claudes auto-post here when they complete work. Humans can also post manually.
- **Filter:** By actor (dropdown)
- **Display:** Reverse chronological. Show actor name, action text, timestamp. If context links to a task/issue, render as clickable.

### Tab 5: Decision Log (new)
Shared architectural decisions:
- **Fields:** title, description (full rationale), status, category, supersededBy (self-reference), timestamps
- **Statuses:** Settled / Open / Superseded
- **Categories:** Architecture, Design, Security, Orders, Email, Calendar, Dashboard, Contacts, Portal, etc.
- **Searchable:** Text search on title + description
- **Display:** Card list, expandable. Status badge. If superseded, show link to replacement decision.

---

## Database Schema

All tables use Drizzle ORM with PostgreSQL (Neon). Run `npm run db:push` to sync.

### New table: `boards`
```
id          serial PK
name        varchar(100) NOT NULL
description text
createdAt   timestamp DEFAULT now()
updatedAt   timestamp DEFAULT now()
```

### Extend: `columns` — add boardId
```
boardId     integer FK → boards.id, NOT NULL, DEFAULT 1
```

### Extend: `tasks` — add priority, labels, assignee, dueDate, boardId
```
priority    varchar(2)          -- 'P0', 'P1', 'P2', 'P3' or null
labels      text                -- JSON array: '["Orders","Email"]'
assignee    varchar(100)        -- "Kyle's Claude", "Nghiem", etc.
dueDate     timestamp           -- nullable
boardId     integer FK → boards.id, NOT NULL, DEFAULT 1
```

### New table: `issues`
```
id                serial PK
title             varchar(255) NOT NULL
description       text
priority          varchar(2) NOT NULL DEFAULT 'P2'
status            varchar(20) NOT NULL DEFAULT 'backlog'
component         varchar(100)
assignee          varchar(100)
reporter          varchar(100)
versionFound      varchar(20)
versionFixed      varchar(20)
stepsToReproduce  text
attachments       text            -- JSON array: '[{"url":"...","name":"file.pdf","type":"application/pdf","size":1234}]'
customFields      text            -- JSON object: '{"field_name":"value"}'
createdAt         timestamp DEFAULT now()
updatedAt         timestamp DEFAULT now()
```

### New table: `roadmapItems`
```
id            serial PK
title         varchar(255) NOT NULL
description   text
phase         varchar(20) NOT NULL DEFAULT 'backlog'
status        varchar(20) NOT NULL DEFAULT 'backlog'
assignees     text            -- JSON array: '["Kyle","Nghiem Claude"]'
startDate     timestamp
targetDate    timestamp
dependencies  text            -- JSON array of roadmapItem IDs: '[3, 7]'
owner         varchar(100)    -- single person responsible
estimate      varchar(50)     -- freeform: "2 weeks", "1 sprint"
sortOrder     integer DEFAULT 0
attachments   text            -- JSON array: '[{"url":"...","name":"...","type":"...","size":1234}]'
createdAt     timestamp DEFAULT now()
updatedAt     timestamp DEFAULT now()
```

### New table: `activities`
```
id          serial PK
actor       varchar(100) NOT NULL
action      text NOT NULL
context     text            -- JSON: '{"type":"issue","id":42}'
metadata    text            -- optional extra JSON
createdAt   timestamp DEFAULT now()
```
**No updatedAt. No PATCH/DELETE.** Append-only by design.

### New table: `decisions`
```
id            serial PK
title         varchar(255) NOT NULL
description   text NOT NULL
status        varchar(20) NOT NULL DEFAULT 'settled'
category      varchar(50)
supersededBy  integer         -- self-reference to decisions.id
createdAt     timestamp DEFAULT now()
updatedAt     timestamp DEFAULT now()
```

---

## API Endpoints

### Boards
| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/boards` | — | `Board[]` |
| POST | `/api/boards` | `{name, description?}` | `Board` (201) |
| GET | `/api/boards/[id]` | — | `Board` |
| PATCH | `/api/boards/[id]` | `{name?, description?}` | `Board` |
| DELETE | `/api/boards/[id]` | — | Cascade deletes columns + tasks |

### Board View (modify existing)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/board?boardId=1` | Add boardId filter. Default to 1 for backward compat |

### Tasks (extend existing)
| Method | Path | Body/Params | Notes |
|--------|------|------------|-------|
| GET | `/api/tasks?boardId=&columnId=&priority=&assignee=&label=` | Query filters | Extended filters |
| POST | `/api/tasks` | `{title, description?, columnId?, notes?, priority?, labels?, assignee?, dueDate?, boardId?}` | Extended fields |
| GET | `/api/tasks/[id]` | — | No change |
| PATCH | `/api/tasks/[id]` | Any subset of fields | Add new fields |
| DELETE | `/api/tasks/[id]` | — | No change |

### Issues (new)
| Method | Path | Body/Params |
|--------|------|------------|
| GET | `/api/issues?priority=&status=&component=&assignee=&search=` | Filterable. `search` = ILIKE on title+description |
| POST | `/api/issues` | `{title, description?, priority?, status?, component?, assignee?, reporter?, versionFound?, stepsToReproduce?, attachments?, customFields?}` |
| GET | `/api/issues/[id]` | — |
| PATCH | `/api/issues/[id]` | Any subset. Auto-sets updatedAt |
| DELETE | `/api/issues/[id]` | — |

### Roadmap (new)
| Method | Path | Body/Params |
|--------|------|------------|
| GET | `/api/roadmap?phase=&status=&assignee=` | Filterable |
| POST | `/api/roadmap` | `{title, description?, phase?, status?, assignees?, startDate?, targetDate?, dependencies?, sortOrder?, owner?, estimate?, attachments?}` |
| GET | `/api/roadmap/[id]` | — |
| PATCH | `/api/roadmap/[id]` | Any subset. Auto-sets updatedAt |
| DELETE | `/api/roadmap/[id]` | — |

### Activities (new — append-only)
| Method | Path | Body/Params |
|--------|------|------------|
| GET | `/api/activities?actor=&limit=50&offset=0` | Paginated, newest-first |
| POST | `/api/activities` | `{actor, action, context?, metadata?}` |
| GET | `/api/activities/[id]` | — |

**No PATCH. No DELETE.** Immutable audit log.

### Decisions (new)
| Method | Path | Body/Params |
|--------|------|------------|
| GET | `/api/decisions?status=&category=&search=` | Filterable. `search` = ILIKE on title+description |
| POST | `/api/decisions` | `{title, description, status?, category?}` |
| GET | `/api/decisions/[id]` | — |
| PATCH | `/api/decisions/[id]` | Any subset. Supports `supersededBy` |
| DELETE | `/api/decisions/[id]` | — |

### Seed (extend existing)
| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/seed` | Also creates default board (id=1). Assigns boardId=1 to existing columns |

---

## Component Architecture

### File Structure (new + modified)
```
components/
  // Shell & Navigation
  AppShell.tsx              -- NEW: Top-level layout with tab bar + header
  TabBar.tsx                -- NEW: Kanban | Issues | Roadmap | Activity | Decisions

  // Kanban Tab (enhanced)
  Board.tsx                 -- MODIFY: Add boardId prop, board selector
  BoardSelector.tsx         -- NEW: Dropdown to switch boards
  Column.tsx                -- MODIFY: Minimal (tasks render new badges)
  TaskCard.tsx              -- MODIFY: Priority badge, labels, assignee, due date
  AddTaskModal.tsx          -- MODIFY: New fields in form

  // Shared
  PriorityBadge.tsx         -- NEW: P0/P1/P2/P3 color-coded
  StatusBadge.tsx           -- NEW: Status with appropriate color
  LabelPill.tsx             -- NEW: Component label tag

  // Issues Tab
  IssueList.tsx             -- NEW: Filterable table
  IssueRow.tsx              -- NEW: Table row with quick actions
  IssueDetail.tsx           -- NEW: Expanded modal with all fields
  IssueFilters.tsx          -- NEW: Filter bar
  CreateIssueModal.tsx      -- NEW: Creation form

  // Roadmap Tab
  RoadmapTimeline.tsx       -- NEW: Timeline container with swimlanes
  RoadmapItem.tsx           -- NEW: Single timeline bar/chip
  RoadmapFilters.tsx        -- NEW: Phase/assignee/status filters
  CreateRoadmapModal.tsx    -- NEW: Creation/edit form
  DependencyLine.tsx        -- NEW: SVG line connecting dependent items

  // Activity Tab
  ActivityFeed.tsx          -- NEW: Paginated timeline
  ActivityEntry.tsx         -- NEW: Single entry card
  ActivityFilters.tsx       -- NEW: Actor filter

  // Decisions Tab
  DecisionList.tsx          -- NEW: Searchable list
  DecisionCard.tsx          -- NEW: Card with status badge
  DecisionDetail.tsx        -- NEW: Expanded view
  CreateDecisionModal.tsx   -- NEW: Form

lib/
  schema.ts                 -- MODIFY: Add all new tables, extend tasks
  constants.ts              -- NEW: Enums for priorities, statuses, components, phases, team members
  db.ts                     -- existing (no change)
```

---

## Constants (`lib/constants.ts`)

```typescript
export const PRIORITIES = ['P0', 'P1', 'P2', 'P3'] as const;
export const PRIORITY_LABELS = { P0: 'Critical', P1: 'High', P2: 'Medium', P3: 'Low' };
export const PRIORITY_COLORS = { P0: '#EF4444', P1: '#F97316', P2: '#EAB308', P3: '#6B7280' };

export const ISSUE_STATUSES = ['backlog', 'triaged', 'in_progress', 'fixed', 'closed', 'wont_fix'] as const;
export const ISSUE_STATUS_LABELS = { backlog: 'Backlog', triaged: 'Triaged', in_progress: 'In Progress', fixed: 'Fixed', closed: 'Closed', wont_fix: "Won't Fix" };

export const COMPONENTS = ['Orders', 'Email', 'Calendar', 'Dashboard', 'Store Detail', 'Contact Detail', 'Admin', 'Map', 'Activity', 'Auth', 'Cloud Functions', 'Other'] as const;

export const ROADMAP_PHASES = ['immediate', 'short_term', 'medium_term', 'long_term'] as const;
export const ROADMAP_PHASE_LABELS = { immediate: 'Immediate', short_term: 'Short-term', medium_term: 'Medium-term', long_term: 'Long-term' };

export const ROADMAP_STATUSES = ['backlog', 'mockup', 'approved', 'in_progress', 'done'] as const;

export const DECISION_STATUSES = ['settled', 'open', 'superseded'] as const;
export const DECISION_CATEGORIES = ['Architecture', 'Design', 'Security', 'Orders', 'Email', 'Calendar', 'Dashboard', 'Contacts', 'Portal', 'Infrastructure'] as const;

export const TEAM_MEMBERS = ["Kyle", "Nghiem", "Kyle's Claude", "Nghiem's Claude"] as const;
```

---

## Implementation Order

| Phase | What | Est. Hours |
|-------|------|-----------|
| 1 | Fork repo, set up new Neon DB, update schema + constants | 1-2h |
| 2 | API routes for all new endpoints (issues, roadmap, activities, decisions, boards) | 3-4h |
| 3 | App shell + tab navigation (AppShell, TabBar) | 1-2h |
| 4 | Enhanced kanban (priority/labels/assignee/dueDate/boards) | 2-3h |
| 5 | Issue tracker tab (table, filters, detail modal, create modal) | 3-4h |
| 6 | Roadmap tab (timeline, dependency lines, filters, create modal) | 3-4h |
| 7 | Activity feed tab (feed, entries, filters) | 1-2h |
| 8 | Decision log tab (list, detail, create modal) | 2-3h |
| 9 | Polish: CSS variables, responsive, dark mode audit, deploy | 1-2h |
| **Total** | | **~18-26h** |

---

## How Claudes Use It

Both Claudes interact via REST API. Example usage:

```bash
# Log completed work
POST /api/activities
{"actor": "Nghiem's Claude", "action": "Cleaned up 57 console.logs across 6 JS files"}

# Create a bug
POST /api/issues
{"title": "Silent catch in orders.js line 340", "priority": "P1", "component": "Orders", "reporter": "Nghiem's Claude"}

# Add a roadmap item
POST /api/roadmap
{"title": "Store Portal v1", "phase": "medium_term", "status": "backlog", "assignees": ["Kyle's Claude"], "owner": "Kyle", "estimate": "3 sprints", "dependencies": [3]}

# Check decisions before modifying orders code
GET /api/decisions?category=Orders

# Update issue status after fix
PATCH /api/issues/7
{"status": "fixed", "versionFixed": "v67.5", "assignee": "Nghiem's Claude"}
```

---

## Design Notes

- **Dark mode first** — matches existing kanban aesthetic
- **No auth** — private tool, not public. If needed later, add simple API key header check
- **Labels as JSON text** — small fixed set, no join table needed
- **Activities are append-only** — no edit/delete, trustworthy audit trail
- **boardId defaults to 1** — backward compatible with existing data
- **TypeScript strict** — follow the kanban project's conventions (const/let, arrow functions, ES modules). NOT the MWAH CRM conventions (var, function declarations) since this is a separate project.

---

## Pre-Seed Data (for MWAH CRM project)

After building, seed with the current MWAH bugs and roadmap:

### Issues to seed
1. P1: 57 console.log statements in production
2. P1: 12 completely empty catch blocks
3. P1: firebase-admin version mismatch (root ^13.6.1 vs functions ^12.0.0)
4. P2: 6 modals on old pre-al-* styling
5. P2: Dead code (openActivityModal references)
6. P2: Stale docs referencing full-page order detail (now modal v67.4)
7. P3: Voice recording debug logs in quick-log.js

### Roadmap to seed
1. Immediate: Order Detail Modal (mockup X5K-0 approved)
2. Immediate: Place Order Form restyle (mockup 2XM-0)
3. Short-term: CSV Reconciliation (blocks Store Portal)
4. Short-term: Dashboard Notifications (mockup K8H-0)
5. Short-term: Old Modal Cleanup (6 modals)
6. Medium-term: Store Portal v1
7. Medium-term: Analytics Dashboards
8. Long-term: Portal VMI phases
9. Long-term: AI features (draft system)

### Decisions to seed (from MWAH decisions.md)
1. Order detail is MODAL not full page (OL15)
2. MWAH-XXX order numbers at creation (O1)
3. Soft delete only — no hard deletes (D4)
4. GrowFlow is source of truth for revenue (A6)
5. Cancel requires reason (OL3)
6. CSV is final word for sales data (OL9)
