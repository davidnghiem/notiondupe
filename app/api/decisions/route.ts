import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decisions } from '@/lib/schema';
import { desc, eq, ilike, or, and, type SQL } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const conditions: SQL[] = [];
    if (status) conditions.push(eq(decisions.status, status));
    if (category) conditions.push(eq(decisions.category, category));
    if (search) {
      conditions.push(
        or(
          ilike(decisions.title, `%${search}%`),
          ilike(decisions.description, `%${search}%`)
        )!
      );
    }

    const result = await db
      .select()
      .from(decisions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(decisions.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching decisions:', error);
    return NextResponse.json({ error: 'Failed to fetch decisions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const newDecision = await db
      .insert(decisions)
      .values({
        title: body.title,
        description: body.description,
        status: body.status || 'settled',
        category: body.category,
      })
      .returning();

    return NextResponse.json(newDecision[0], { status: 201 });
  } catch (error) {
    console.error('Error creating decision:', error);
    return NextResponse.json({ error: 'Failed to create decision' }, { status: 500 });
  }
}
