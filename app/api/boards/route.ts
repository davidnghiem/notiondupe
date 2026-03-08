import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { boards } from '@/lib/schema';
import { asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allBoards = await db
      .select()
      .from(boards)
      .orderBy(asc(boards.id));
    return NextResponse.json(allBoards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newBoard = await db
      .insert(boards)
      .values({ name, description })
      .returning();

    return NextResponse.json(newBoard[0], { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json({ error: 'Failed to create board' }, { status: 500 });
  }
}
