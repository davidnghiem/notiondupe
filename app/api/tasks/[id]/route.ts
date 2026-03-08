import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const task = await db.select().from(tasks).where(eq(tasks.id, parseInt(id))).limit(1);
    if (task.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    const t = task[0];
    return NextResponse.json({
      ...t,
      labels: t.labels ? JSON.parse(t.labels) : [],
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.columnId !== undefined) updateData.columnId = body.columnId;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.labels !== undefined) updateData.labels = typeof body.labels === 'string' ? body.labels : JSON.stringify(body.labels);
    if (body.assignee !== undefined) updateData.assignee = body.assignee;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.boardId !== undefined) updateData.boardId = body.boardId;
    updateData.updatedAt = new Date();

    const updated = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    const t = updated[0];
    return NextResponse.json({
      ...t,
      labels: t.labels ? JSON.parse(t.labels) : [],
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const deleted = await db.delete(tasks).where(eq(tasks.id, parseInt(id))).returning();
    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
