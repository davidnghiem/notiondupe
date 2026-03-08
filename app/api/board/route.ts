import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { columns, tasks } from '@/lib/schema';
import { asc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/board - Get full board state (columns with tasks)
// Supports ?boardId=N (defaults to 1 for backward compat)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = parseInt(searchParams.get('boardId') || '1');

    const allColumns = await db
      .select()
      .from(columns)
      .where(eq(columns.boardId, boardId))
      .orderBy(asc(columns.position));

    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.boardId, boardId))
      .orderBy(asc(tasks.position));

    const board = allColumns.map((column) => ({
      ...column,
      tasks: allTasks
        .filter((task) => task.columnId === column.id)
        .map((task) => ({
          ...task,
          labels: task.labels ? JSON.parse(task.labels) : [],
        })),
    }));

    return NextResponse.json({
      columns: board,
      totalTasks: allTasks.length,
    });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json({ error: 'Failed to fetch board' }, { status: 500 });
  }
}
