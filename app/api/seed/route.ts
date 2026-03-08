import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { boards, columns, issues, roadmapItems, decisions } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 0. Create tables if they don't exist (fresh deployment)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS boards (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS columns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        position INTEGER NOT NULL,
        board_id INTEGER NOT NULL DEFAULT 1 REFERENCES boards(id),
        created_at TIMESTAMP DEFAULT now()
      )`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        column_id INTEGER REFERENCES columns(id),
        position INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        priority VARCHAR(2),
        labels TEXT,
        assignee VARCHAR(100),
        due_date TIMESTAMP,
        board_id INTEGER NOT NULL DEFAULT 1 REFERENCES boards(id),
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(2) NOT NULL DEFAULT 'P2',
        status VARCHAR(20) NOT NULL DEFAULT 'backlog',
        component VARCHAR(100),
        assignee VARCHAR(100),
        reporter VARCHAR(100),
        version_found VARCHAR(20),
        version_fixed VARCHAR(20),
        steps_to_reproduce TEXT,
        attachments TEXT,
        custom_fields TEXT,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS roadmap_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        phase VARCHAR(20) NOT NULL DEFAULT 'backlog',
        status VARCHAR(20) NOT NULL DEFAULT 'backlog',
        assignees TEXT,
        start_date TIMESTAMP,
        target_date TIMESTAMP,
        dependencies TEXT,
        sort_order INTEGER DEFAULT 0,
        attachments TEXT,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        actor VARCHAR(100) NOT NULL,
        action TEXT NOT NULL,
        context TEXT,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT now()
      )`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS decisions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'settled',
        category VARCHAR(50),
        superseded_by INTEGER,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )`);

    // 1. Ensure default board exists
    const existingBoards = await db.select().from(boards);
    if (existingBoards.length === 0) {
      await db.insert(boards).values({ name: 'Default', description: 'Default project board' });
    }

    // 2. Seed columns if none exist
    const existingColumns = await db.select().from(columns);
    let createdColumns = existingColumns;
    if (existingColumns.length === 0) {
      createdColumns = await db
        .insert(columns)
        .values([
          { name: 'To Do', position: 0, boardId: 1 },
          { name: 'In Progress', position: 1, boardId: 1 },
          { name: 'Done', position: 2, boardId: 1 },
        ])
        .returning();
    }

    // 3. Seed issues if none exist
    const existingIssues = await db.select().from(issues);
    if (existingIssues.length === 0) {
      await db.insert(issues).values([
        { title: '57 console.log statements in production', priority: 'P1', status: 'backlog', component: 'Other', reporter: "Nghiem's Claude" },
        { title: '12 completely empty catch blocks', priority: 'P1', status: 'backlog', component: 'Other', reporter: "Nghiem's Claude" },
        { title: 'firebase-admin version mismatch (root ^13.6.1 vs functions ^12.0.0)', priority: 'P1', status: 'backlog', component: 'Cloud Functions', reporter: "Nghiem's Claude" },
        { title: '6 modals on old pre-al-* styling', priority: 'P2', status: 'backlog', component: 'Dashboard', reporter: "Nghiem's Claude" },
        { title: 'Dead code (openActivityModal references)', priority: 'P2', status: 'backlog', component: 'Activity', reporter: "Nghiem's Claude" },
        { title: 'Stale docs referencing full-page order detail (now modal v67.4)', priority: 'P2', status: 'backlog', component: 'Orders', reporter: "Nghiem's Claude" },
        { title: 'Voice recording debug logs in quick-log.js', priority: 'P3', status: 'backlog', component: 'Other', reporter: "Nghiem's Claude" },
      ]);
    }

    // 4. Seed roadmap items if none exist
    const existingRoadmap = await db.select().from(roadmapItems);
    if (existingRoadmap.length === 0) {
      await db.insert(roadmapItems).values([
        { title: 'Order Detail Modal', description: 'Mockup X5K-0 approved', phase: 'immediate', status: 'approved', sortOrder: 0 },
        { title: 'Place Order Form restyle', description: 'Mockup 2XM-0', phase: 'immediate', status: 'mockup', sortOrder: 1 },
        { title: 'CSV Reconciliation', description: 'Blocks Store Portal', phase: 'short_term', status: 'backlog', sortOrder: 2 },
        { title: 'Dashboard Notifications', description: 'Mockup K8H-0', phase: 'short_term', status: 'mockup', sortOrder: 3 },
        { title: 'Old Modal Cleanup', description: '6 modals to update', phase: 'short_term', status: 'backlog', sortOrder: 4 },
        { title: 'Store Portal v1', phase: 'medium_term', status: 'backlog', dependencies: '[3]', sortOrder: 5 },
        { title: 'Analytics Dashboards', phase: 'medium_term', status: 'backlog', sortOrder: 6 },
        { title: 'Portal VMI phases', phase: 'long_term', status: 'backlog', sortOrder: 7 },
        { title: 'AI features (draft system)', phase: 'long_term', status: 'backlog', sortOrder: 8 },
      ]);
    }

    // 5. Seed decisions if none exist
    const existingDecisions = await db.select().from(decisions);
    if (existingDecisions.length === 0) {
      await db.insert(decisions).values([
        { title: 'Order detail is MODAL not full page', description: 'Decision OL15: Order detail view uses a modal overlay instead of navigating to a separate page. This keeps context and improves workflow speed.', status: 'settled', category: 'Orders' },
        { title: 'MWAH-XXX order numbers at creation', description: 'Decision O1: Order numbers follow MWAH-XXX format and are assigned at creation time, not after submission.', status: 'settled', category: 'Orders' },
        { title: 'Soft delete only — no hard deletes', description: 'Decision D4: All records use soft delete (archived flag) rather than hard deletion. This preserves audit trail and allows recovery.', status: 'settled', category: 'Architecture' },
        { title: 'GrowFlow is source of truth for revenue', description: 'Decision A6: GrowFlow system is the canonical source for all revenue data. MWAH CRM syncs but does not originate financial data.', status: 'settled', category: 'Architecture' },
        { title: 'Cancel requires reason', description: 'Decision OL3: Cancelling an order requires a reason to be entered. This creates accountability and helps track patterns.', status: 'settled', category: 'Orders' },
        { title: 'CSV is final word for sales data', description: 'Decision OL9: When discrepancies exist between CSV import data and manual entries, CSV data takes precedence as the authoritative source.', status: 'settled', category: 'Orders' },
      ]);
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      columns: createdColumns,
    }, { status: 201 });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
