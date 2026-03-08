import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { desc, eq, and, type SQL } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const columnId = searchParams.get('columnId');
    const boardId = searchParams.get('boardId');
    const priority = searchParams.get('priority');
    const assignee = searchParams.get('assignee');

    const conditions: SQL[] = [];
    if (columnId) conditions.push(eq(tasks.columnId, parseInt(columnId)));
    if (boardId) conditions.push(eq(tasks.boardId, parseInt(boardId)));
    if (priority) conditions.push(eq(tasks.priority, priority));
    if (assignee) conditions.push(eq(tasks.assignee, assignee));

    const result = await db
      .select()
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(columnId ? tasks.position : desc(tasks.createdAt));

    const parsed = result.map((task) => ({
      ...task,
      labels: task.labels ? JSON.parse(task.labels) : [],
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, columnId, notes, position, priority, labels, assignee, dueDate, boardId } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const targetColumnId = columnId || 1;
    const targetBoardId = boardId || 1;

    let taskPosition = position;
    if (taskPosition === undefined) {
      const existingTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.columnId, targetColumnId));
      taskPosition = existingTasks.length;
    }

    const newTask = await db
      .insert(tasks)
      .values({
        title,
        description,
        columnId: targetColumnId,
        notes,
        position: taskPosition,
        priority,
        labels: labels ? (typeof labels === 'string' ? labels : JSON.stringify(labels)) : null,
        assignee,
        dueDate: dueDate ? new Date(dueDate) : null,
        boardId: targetBoardId,
      })
      .returning();

    const task = newTask[0];
    return NextResponse.json({
      ...task,
      labels: task.labels ? JSON.parse(task.labels) : [],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
