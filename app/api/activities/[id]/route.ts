import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activities } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

// GET only — no PATCH, no DELETE (immutable audit log)
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const entry = await db.select().from(activities).where(eq(activities.id, parseInt(id))).limit(1);
    if (entry.length === 0) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }
    const a = entry[0];
    return NextResponse.json({
      ...a,
      context: a.context ? JSON.parse(a.context) : null,
      metadata: a.metadata ? JSON.parse(a.metadata) : null,
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
