import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';

// ─── Boards ──────────────────────────────────────────────
export const boards = pgTable('boards', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Columns (extended with boardId) ─────────────────────
export const columns = pgTable('columns', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  position: integer('position').notNull(),
  boardId: integer('board_id').references(() => boards.id).notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Tasks (extended with priority, labels, assignee, dueDate, boardId) ──
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  columnId: integer('column_id').references(() => columns.id),
  position: integer('position').notNull().default(0),
  notes: text('notes'),
  priority: varchar('priority', { length: 2 }),
  labels: text('labels'),
  assignee: varchar('assignee', { length: 100 }),
  dueDate: timestamp('due_date'),
  boardId: integer('board_id').references(() => boards.id).notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Issues ──────────────────────────────────────────────
export const issues = pgTable('issues', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  priority: varchar('priority', { length: 2 }).notNull().default('P2'),
  status: varchar('status', { length: 20 }).notNull().default('new'),
  component: varchar('component', { length: 100 }),
  assignee: varchar('assignee', { length: 100 }),
  reporter: varchar('reporter', { length: 100 }),
  versionFound: varchar('version_found', { length: 20 }),
  versionFixed: varchar('version_fixed', { length: 20 }),
  stepsToReproduce: text('steps_to_reproduce'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Roadmap Items ───────────────────────────────────────
export const roadmapItems = pgTable('roadmap_items', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  phase: varchar('phase', { length: 20 }).notNull().default('backlog'),
  status: varchar('status', { length: 20 }).notNull().default('backlog'),
  assignees: text('assignees'),
  startDate: timestamp('start_date'),
  targetDate: timestamp('target_date'),
  dependencies: text('dependencies'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Activities (append-only) ────────────────────────────
export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  actor: varchar('actor', { length: 100 }).notNull(),
  action: text('action').notNull(),
  context: text('context'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Decisions ───────────────────────────────────────────
export const decisions = pgTable('decisions', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('settled'),
  category: varchar('category', { length: 50 }),
  supersededBy: integer('superseded_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ─── Type Exports ────────────────────────────────────────
export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;
export type Column = typeof columns.$inferSelect;
export type NewColumn = typeof columns.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
export type RoadmapItem = typeof roadmapItems.$inferSelect;
export type NewRoadmapItem = typeof roadmapItems.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type Decision = typeof decisions.$inferSelect;
export type NewDecision = typeof decisions.$inferInsert;
