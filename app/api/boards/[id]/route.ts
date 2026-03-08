import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { boards, columns, tasks } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const board = await db.select().from(boards).where(eq(boards.id, parseInt(id))).limit(1);
    if (board.length === 0) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    return NextResponse.json(board[0]);
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json({ error: 'Failed to fetch board' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    updateData.updatedAt = new Date();

    const updated = await db
      .update(boards)
      .set(updateData)
      .where(eq(boards.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json({ error: 'Failed to update board' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const boardId = parseInt(id);

    // Cascade: delete tasks in this board's columns, then columns, then board
    const boardColumns = await db.select().from(columns).where(eq(columns.boardId, boardId));
    for (const col of boardColumns) {
      await db.delete(tasks).where(eq(tasks.columnId, col.id));
    }
    await db.delete(columns).where(eq(columns.boardId, boardId));
    await db.delete(tasks).where(eq(tasks.boardId, boardId));

    const deleted = await db.delete(boards).where(eq(boards.id, boardId)).returning();
    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json({ error: 'Failed to delete board' }, { status: 500 });
  }
}
