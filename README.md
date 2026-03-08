# MWAH Project Hub

Project management tool for the MWAH CRM team. Used by both humans and AI agents (Claudes) to track bugs, plan roadmap, log activity, and record architectural decisions.

**Live:** Deployed on Vercel
**Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + PostgreSQL (Supabase) + Drizzle ORM

---

## Tabs

| Tab | Purpose |
|-----|---------|
| **Kanban** | Drag-and-drop task board with columns. Multi-select filters for assignee and priority. Shows creation dates on cards. |
| **Issues** | Bug/issue tracker with sortable table, Notion-style multi-select filters, inline editing, custom fields, file attachments |
| **Roadmap** | Feature timeline grouped by phase with color-coded cards, owner assignment, time estimates, and multi-select filters |
| **Activity** | Append-only activity feed with color-coded actor avatars — immutable audit log |
| **Decisions** | Architectural decision log with statuses (Settled, Open, Superseded) |

---

## UI Features

- **Notion-style multi-select filters** across Kanban, Issues, and Roadmap tabs — click "+ Filter" to add filter dimensions, select multiple values with checkboxes
- **Color-coded navigation** — each tab has a distinct accent color (blue, red, amber, green, purple)
- **Color-coded actors** — team members have consistent colors across Activity feed and Roadmap owner avatars
- **Phase-colored roadmap** — Immediate (red), Short-term (orange), Medium-term (blue), Long-term (gray) with colored card borders and headers
- **Inline editing** — click any property in Issue or Roadmap detail panels to edit in place
- **File attachments** — drag-and-drop file uploads via Supabase Storage on Issues and Roadmap items
- **Sortable columns** — click column headers in the Issues table to sort by priority, status, title, component, or assignee

---

## REST API Reference

All endpoints return JSON. Base URL is your deployment root (e.g. `https://your-app.vercel.app`).

### Tasks (Kanban)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks?boardId=&columnId=&priority=&assignee=&label=` | List tasks with optional filters |
| `POST` | `/api/tasks` | Create task |
| `GET` | `/api/tasks/[id]` | Get single task |
| `PATCH` | `/api/tasks/[id]` | Update task (any subset of fields) |
| `DELETE` | `/api/tasks/[id]` | Delete task |

**POST/PATCH body fields:** `title`, `description`, `columnId`, `position`, `notes`, `priority` (P0-P3), `labels` (JSON array), `assignee`, `dueDate`, `boardId`

### Board View

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/board?boardId=1` | Full board with columns + tasks. Defaults to board 1 |

### Issues

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/issues?priority=&status=&component=&assignee=&search=` | List issues with filters. `search` does ILIKE on title+description |
| `POST` | `/api/issues` | Create issue |
| `GET` | `/api/issues/[id]` | Get single issue |
| `PATCH` | `/api/issues/[id]` | Update issue (any subset of fields) |
| `DELETE` | `/api/issues/[id]` | Delete issue |

**POST/PATCH body fields:** `title`, `description`, `priority` (P0-P3), `status`, `component`, `assignee`, `reporter`, `versionFound`, `versionFixed`, `stepsToReproduce`, `attachments` (JSON array), `customFields` (JSON object)

**Statuses:** `backlog`, `triaged`, `in_progress`, `fixed`, `closed`, `wont_fix`

**Components:** Orders, Email, Calendar, Dashboard, Store Detail, Contact Detail, Admin, Map, Activity, Auth, Cloud Functions, Other

### Roadmap

**Important:** The Roadmap is for **high-level projects and features only** — things like "Store Portal v1", "Analytics Dashboards", "CSV Reconciliation". Do NOT put small tasks, bug fixes, or infrastructure work here. Those belong in **Issues** (for bugs/problems) or **Kanban** (for task tracking). If it takes less than a week or isn't a distinct product feature, it's not a roadmap item.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/roadmap?phase=&status=&assignee=` | List roadmap items with filters |
| `POST` | `/api/roadmap` | Create roadmap item |
| `GET` | `/api/roadmap/[id]` | Get single item |
| `PATCH` | `/api/roadmap/[id]` | Update item (any subset of fields) |
| `DELETE` | `/api/roadmap/[id]` | Delete item |

**POST/PATCH body fields:** `title`, `description`, `phase`, `status`, `assignees` (JSON array), `startDate`, `targetDate`, `dependencies` (JSON array of IDs), `sortOrder`, `owner`, `estimate`, `attachments` (JSON array)

**Phases:** `immediate`, `short_term`, `medium_term`, `long_term`
**Statuses:** `backlog`, `mockup`, `approved`, `in_progress`, `done`

### Activities (Append-Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/activities?actor=&limit=50&offset=0` | List activities, newest first |
| `POST` | `/api/activities` | Log an activity |
| `GET` | `/api/activities/[id]` | Get single activity |

**No PATCH. No DELETE.** This is an immutable audit log.

**POST body fields:** `actor` (required), `action` (required), `context` (optional JSON string, e.g. `{"type":"issue","id":42}`), `metadata` (optional JSON string)

### Decisions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/decisions?status=&category=&search=` | List decisions with filters |
| `POST` | `/api/decisions` | Create decision |
| `GET` | `/api/decisions/[id]` | Get single decision |
| `PATCH` | `/api/decisions/[id]` | Update decision |
| `DELETE` | `/api/decisions/[id]` | Delete decision |

**POST/PATCH body fields:** `title`, `description`, `status`, `category`, `supersededBy` (ID of replacement decision)

**Statuses:** `settled`, `open`, `superseded`
**Categories:** Architecture, Design, Security, Orders, Email, Calendar, Dashboard, Contacts, Portal, Infrastructure

### Boards

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/boards` | List all boards |
| `POST` | `/api/boards` | Create board |
| `PATCH` | `/api/boards/[id]` | Update board |
| `DELETE` | `/api/boards/[id]` | Delete board (cascades columns + tasks) |

### Seed

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/seed` | Seed database with default board, columns, sample issues, roadmap items, and decisions |

### Upload (File Attachments)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload a file (multipart form data, max 10MB). Returns `{url, name, type, size}` |

---

## Example API Usage (for Claudes)

```bash
# Log completed work
curl -X POST https://your-app.vercel.app/api/activities \
  -H "Content-Type: application/json" \
  -d '{"actor": "Nghiem'\''s Claude", "action": "Cleaned up 57 console.logs across 6 JS files"}'

# Create a bug
curl -X POST https://your-app.vercel.app/api/issues \
  -H "Content-Type: application/json" \
  -d '{"title": "Silent catch in orders.js line 340", "priority": "P1", "component": "Orders", "reporter": "Nghiem'\''s Claude"}'

# Update issue status after fixing
curl -X PATCH https://your-app.vercel.app/api/issues/7 \
  -H "Content-Type: application/json" \
  -d '{"status": "fixed", "versionFixed": "v67.5", "assignee": "Nghiem'\''s Claude"}'

# Check decisions before modifying orders code
curl https://your-app.vercel.app/api/decisions?category=Orders

# Add a roadmap item with owner and estimate
curl -X POST https://your-app.vercel.app/api/roadmap \
  -H "Content-Type: application/json" \
  -d '{"title": "Store Portal v1", "phase": "medium_term", "status": "backlog", "assignees": ["Kyle'\''s Claude"], "owner": "Kyle", "estimate": "3 sprints", "dependencies": [3]}'

# Search issues
curl "https://your-app.vercel.app/api/issues?search=console.log&priority=P1"
```

---

## Team Members

These are the valid values for `assignee`, `reporter`, `actor`, and `owner` fields:

- `Kyle`
- `Nghiem`
- `Kyle's Claude`
- `Nghiem's Claude`

---

## Priority Levels

| Code | Label | Use for |
|------|-------|---------|
| `P0` | Critical | Production-breaking, needs immediate fix |
| `P1` | High | Major bug or blocker, fix this sprint |
| `P2` | Medium | Should fix, but not blocking |
| `P3` | Low | Nice to have, backlog |

---

## Local Development

```bash
npm install
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run db:push    # Sync schema to database
```

**Environment variables** (`.env.local`):
```
POSTGRES_URL=postgresql://...          # Supabase/Neon connection string
NEXT_PUBLIC_SUPABASE_URL=https://...   # For file uploads (Supabase Storage)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_...   # For file uploads (Supabase Storage)
```
