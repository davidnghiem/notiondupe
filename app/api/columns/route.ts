import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { columns } from '@/lib/schema';
import { asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/columns - List all columns
export async function GET() {
  try {
    const allColumns = await db
      .select()
      .from(columns)
      .orderBy(asc(columns.position));

    return NextResponse.json(allColumns);
  } catch (error) {
    console.error('Error fetching columns:', error);
    return NextResponse.json({ error: 'Failed to fetch columns' }, { status: 500 });
  }
}

// POST /api/columns - Create a new column
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, position } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Get max position if not specified
    let columnPosition = position;
    if (columnPosition === undefined) {
      const existingColumns = await db.select().from(columns);
      columnPosition = existingColumns.length;
    }

    const newColumn = await db
      .insert(columns)
      .values({
        name,
        position: columnPosition,
      })
      .returning();

    return NextResponse.json(newColumn[0], { status: 201 });
  } catch (error) {
    console.error('Error creating column:', error);
    return NextResponse.json({ error: 'Failed to create column' }, { status: 500 });
  }
}
