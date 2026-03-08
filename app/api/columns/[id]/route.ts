import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { columns, tasks } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

// GET /api/columns/:id - Get a single column
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const columnId = parseInt(id);

    const column = await db
      .select()
      .from(columns)
      .where(eq(columns.id, columnId))
      .limit(1);

    if (column.length === 0) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 });
    }

    return NextResponse.json(column[0]);
  } catch (error) {
    console.error('Error fetching column:', error);
    return NextResponse.json({ error: 'Failed to fetch column' }, { status: 500 });
  }
}

// PATCH /api/columns/:id - Update a column
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const columnId = parseInt(id);
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.position !== undefined) updateData.position = body.position;

    const updatedColumn = await db
      .update(columns)
      .set(updateData)
      .where(eq(columns.id, columnId))
      .returning();

    if (updatedColumn.length === 0) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 });
    }

    return NextResponse.json(updatedColumn[0]);
  } catch (error) {
    console.error('Error updating column:', error);
    return NextResponse.json({ error: 'Failed to update column' }, { status: 500 });
  }
}

// DELETE /api/columns/:id - Delete a column (and its tasks)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const columnId = parseInt(id);

    // First delete all tasks in this column
    await db.delete(tasks).where(eq(tasks.columnId, columnId));

    // Then delete the column
    const deletedColumn = await db
      .delete(columns)
      .where(eq(columns.id, columnId))
      .returning();

    if (deletedColumn.length === 0) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Column deleted', column: deletedColumn[0] });
  } catch (error) {
    console.error('Error deleting column:', error);
    return NextResponse.json({ error: 'Failed to delete column' }, { status: 500 });
  }
}
