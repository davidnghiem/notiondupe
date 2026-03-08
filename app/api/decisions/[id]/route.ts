import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decisions } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const decision = await db.select().from(decisions).where(eq(decisions.id, parseInt(id))).limit(1);
    if (decision.length === 0) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }
    return NextResponse.json(decision[0]);
  } catch (error) {
    console.error('Error fetching decision:', error);
    return NextResponse.json({ error: 'Failed to fetch decision' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.supersededBy !== undefined) updateData.supersededBy = body.supersededBy;
    updateData.updatedAt = new Date();

    const updated = await db
      .update(decisions)
      .set(updateData)
      .where(eq(decisions.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating decision:', error);
    return NextResponse.json({ error: 'Failed to update decision' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const deleted = await db.delete(decisions).where(eq(decisions.id, parseInt(id))).returning();
    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting decision:', error);
    return NextResponse.json({ error: 'Failed to delete decision' }, { status: 500 });
  }
}
