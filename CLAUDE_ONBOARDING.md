# MWAH Project Hub — Claude Agent Onboarding

This is the shared project hub for the MWAH CRM team. Both humans and AI agents (Claudes) use it to track bugs, plan roadmap, log activity, and coordinate work.

**Project Hub:** https://notiondupe.vercel.app/
**Full API docs:** https://github.com/davidnghiem/notiondupe/blob/main/README.md

---

## Your Workflow (every session)

### 1. Check what's on the board

```bash
# Your assigned bugs
curl "https://notiondupe.vercel.app/api/issues?assignee=YOUR_NAME"

# Your kanban tasks
curl "https://notiondupe.vercel.app/api/tasks?assignee=YOUR_NAME"

# All open issues
curl "https://notiondupe.vercel.app/api/issues?status=triaged"
```

Replace `YOUR_NAME` with your team member name (see Team Members below).

Don't limit yourself to what's assigned — **you can create your own issues and tasks too.** If you spot a bug, find something worth improving, or want to track work you're about to do, log it.

### 2. When you find a bug — create an issue

```bash
curl -X POST https://notiondupe.vercel.app/api/issues \
  -H "Content-Type: application/json" \
  -d '{"title":"Bug description here", "priority":"P1", "component":"Orders", "reporter":"YOUR_NAME"}'
```

### 3. When you fix something — update the issue AND log the activity

```bash
# Mark issue as fixed
curl -X PATCH https://notiondupe.vercel.app/api/issues/ID \
  -H "Content-Type: application/json" \
  -d '{"status":"fixed", "assignee":"YOUR_NAME"}'

# Log what you did (this is permanent — no edits, no deletes)
curl -X POST https://notiondupe.vercel.app/api/activities \
  -H "Content-Type: application/json" \
  -d '{"actor":"YOUR_NAME", "action":"Fixed issue #ID: description of what was done"}'
```

### 4. When you complete a kanban task — move it to Done

```bash
curl -X PATCH https://notiondupe.vercel.app/api/tasks/ID \
  -H "Content-Type: application/json" \
  -d '{"columnId":3}'
```

Column IDs: `1` = To Do, `2` = In Progress, `3` = Done

### 5. Before making architectural decisions — check existing decisions

```bash
curl "https://notiondupe.vercel.app/api/decisions?category=Orders"
```

---

## Git Workflow (IMPORTANT — no more pushing straight to main)

**Never push directly to `main`.** All changes go through branches and pull requests.

### For every piece of work:

```bash
# 1. Make sure you're on latest main
git checkout main
git pull origin main

# 2. Create a feature branch (use descriptive names)
git checkout -b fix/empty-catch-blocks        # for bug fixes
git checkout -b feat/order-detail-modal       # for features
git checkout -b chore/console-log-cleanup     # for cleanup/infra

# 3. Do your work, commit with clear messages
git add <specific-files>
git commit -m "Fix 12 empty catch blocks — add showToast() error feedback"

# 4. Push your branch
git push origin fix/empty-catch-blocks

# 5. Create a pull request
gh pr create --title "Fix 12 empty catch blocks" --body "Added showToast() to all 12 empty catch blocks so users see error feedback instead of silent failures. Closes issue #9."
```

### Branch naming conventions

| Prefix | Use for | Example |
|--------|---------|---------|
| `fix/` | Bug fixes | `fix/empty-catch-blocks` |
| `feat/` | New features | `feat/order-detail-modal` |
| `chore/` | Cleanup, infra, docs | `chore/console-log-cleanup` |
| `refactor/` | Code restructuring | `refactor/activity-modal` |

### Rules
- **One branch per task/issue** — don't bundle unrelated changes
- **Keep PRs small** — easier to review, less risk
- **Reference the issue number** in commit messages and PR descriptions (e.g. "Closes issue #9")
- **Pull latest main** before creating a new branch
- **Don't merge your own PR** if someone else is available to review — but if you're solo, self-merge is fine after giving it a once-over

---

## Prioritization Guide

- Work **high priority first**: P0 (Critical) → P1 (High) → P2 (Medium) → P3 (Low)
- **BUT** if something is a quick fix / low hanging fruit, knock it out even if it's lower priority — don't skip easy wins just because they're P3
- Use your judgment: a 2-minute P3 fix is better to do now than to leave sitting there

---

## What Goes Where

| Thing | Where it goes |
|-------|--------------|
| Bug or problem found | **Issues** tab (`POST /api/issues`) |
| Task to work on | **Kanban** tab (`POST /api/tasks`) |
| Big feature or project | **Roadmap** tab (`POST /api/roadmap`) |
| "I did this" log entry | **Activity** tab (`POST /api/activities`) |
| Architecture/design choice | **Decisions** tab (`POST /api/decisions`) |

**Roadmap is for big features only** — things like "Store Portal v1", "Analytics Dashboards", "CSV Reconciliation". If it takes less than a week or isn't a distinct product feature, it's NOT a roadmap item. Use Issues or Kanban instead.

---

## Team Members

Valid values for `assignee`, `reporter`, and `actor` fields:

- `Kyle`
- `Nghiem`
- `Kyle's Claude`
- `Nghiem's Claude`

---

## Quick Reference

| Action | Endpoint | Method |
|--------|----------|--------|
| Create bug | `/api/issues` | `POST` |
| Update issue after fixing | `/api/issues/[id]` | `PATCH` |
| Log completed work | `/api/activities` | `POST` |
| Move kanban task | `/api/tasks/[id]` | `PATCH` |
| Check decisions | `/api/decisions` | `GET` |
| Create roadmap item | `/api/roadmap` | `POST` |

---

## Priority Levels

| Code | Label | Use for |
|------|-------|---------|
| `P0` | Critical | Production-breaking, needs immediate fix |
| `P1` | High | Major bug or blocker, fix this sprint |
| `P2` | Medium | Should fix, but not blocking |
| `P3` | Low | Nice to have, backlog |

## Issue Statuses

`backlog` → `triaged` → `in_progress` → `fixed` → `closed`

Also available: `wont_fix`

## Components

Orders, Email, Calendar, Dashboard, Store Detail, Contact Detail, Admin, Map, Activity, Auth, Cloud Functions, Other
