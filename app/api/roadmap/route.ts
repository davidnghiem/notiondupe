import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { roadmapItems } from '@/lib/schema';
import { asc, eq, and, type SQL } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phase = searchParams.get('phase');
    const status = searchParams.get('status');
    const assignee = searchParams.get('assignee');

    const conditions: SQL[] = [];
    if (phase) conditions.push(eq(roadmapItems.phase, phase));
    if (status) conditions.push(eq(roadmapItems.status, status));
    // assignee filter: check if assignee string appears in the JSON array text
    // For agents, they can filter by exact match or use search

    const result = await db
      .select()
      .from(roadmapItems)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(roadmapItems.sortOrder));

    // Parse JSON text fields for agent-friendly responses
    const parsed = result.map((item) => ({
      ...item,
      assignees: item.assignees ? JSON.parse(item.assignees) : [],
      dependencies: item.dependencies ? JSON.parse(item.dependencies) : [],
      attachments: item.attachments ? JSON.parse(item.attachments) : [],
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return NextResponse.json({ error: 'Failed to fetch roadmap' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newItem = await db
      .insert(roadmapItems)
      .values({
        title: body.title,
        description: body.description,
        phase: body.phase || 'backlog',
        status: body.status || 'backlog',
        assignees: body.assignees ? (typeof body.assignees === 'string' ? body.assignees : JSON.stringify(body.assignees)) : null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
        dependencies: body.dependencies ? (typeof body.dependencies === 'string' ? body.dependencies : JSON.stringify(body.dependencies)) : null,
        attachments: body.attachments ? (typeof body.attachments === 'string' ? body.attachments : JSON.stringify(body.attachments)) : null,
        owner: body.owner || null,
        estimate: body.estimate || null,
        sortOrder: body.sortOrder ?? 0,
      })
      .returning();

    const item = newItem[0];
    return NextResponse.json({
      ...item,
      assignees: item.assignees ? JSON.parse(item.assignees) : [],
      dependencies: item.dependencies ? JSON.parse(item.dependencies) : [],
      attachments: item.attachments ? JSON.parse(item.attachments) : [],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating roadmap item:', error);
    return NextResponse.json({ error: 'Failed to create roadmap item' }, { status: 500 });
  }
}
