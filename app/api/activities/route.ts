import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activities } from '@/lib/schema';
import { desc, eq, and, type SQL } from 'drizzle-orm';
import { TEAM_MEMBERS } from '@/lib/constants';

// Normalize actor names: fix missing apostrophes, match to canonical TEAM_MEMBERS
function normalizeActor(actor: string): string {
  // Exact match first
  if ((TEAM_MEMBERS as readonly string[]).includes(actor)) return actor;
  // Normalize by stripping apostrophes and comparing
  const stripped = actor.replace(/['']/g, '').toLowerCase();
  for (const member of TEAM_MEMBERS) {
    if (member.replace(/['']/g, '').toLowerCase() === stripped) return member;
  }
  return actor;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const actor = searchParams.get('actor');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const conditions: SQL[] = [];
    if (actor) conditions.push(eq(activities.actor, actor));

    const result = await db
      .select()
      .from(activities)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(activities.createdAt))
      .limit(limit)
      .offset(offset);

    // Parse JSON text fields
    const parsed = result.map((entry) => ({
      ...entry,
      context: entry.context ? JSON.parse(entry.context) : null,
      metadata: entry.metadata ? JSON.parse(entry.metadata) : null,
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

// POST only — append-only log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.actor || !body.action) {
      return NextResponse.json({ error: 'Actor and action are required' }, { status: 400 });
    }

    const newActivity = await db
      .insert(activities)
      .values({
        actor: normalizeActor(body.actor),
        action: body.action,
        context: body.context ? (typeof body.context === 'string' ? body.context : JSON.stringify(body.context)) : null,
        metadata: body.metadata ? (typeof body.metadata === 'string' ? body.metadata : JSON.stringify(body.metadata)) : null,
      })
      .returning();

    const entry = newActivity[0];
    return NextResponse.json({
      ...entry,
      context: entry.context ? JSON.parse(entry.context) : null,
      metadata: entry.metadata ? JSON.parse(entry.metadata) : null,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
