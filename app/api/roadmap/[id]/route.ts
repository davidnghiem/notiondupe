import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { roadmapItems } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const item = await db.select().from(roadmapItems).where(eq(roadmapItems.id, parseInt(id))).limit(1);
    if (item.length === 0) {
      return NextResponse.json({ error: 'Roadmap item not found' }, { status: 404 });
    }
    const r = item[0];
    return NextResponse.json({
      ...r,
      assignees: r.assignees ? JSON.parse(r.assignees) : [],
      dependencies: r.dependencies ? JSON.parse(r.dependencies) : [],
      attachments: r.attachments ? JSON.parse(r.attachments) : [],
    });
  } catch (error) {
    console.error('Error fetching roadmap item:', error);
    return NextResponse.json({ error: 'Failed to fetch roadmap item' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.phase !== undefined) updateData.phase = body.phase;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.assignees !== undefined) updateData.assignees = typeof body.assignees === 'string' ? body.assignees : JSON.stringify(body.assignees);
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.targetDate !== undefined) updateData.targetDate = body.targetDate ? new Date(body.targetDate) : null;
    if (body.dependencies !== undefined) updateData.dependencies = typeof body.dependencies === 'string' ? body.dependencies : JSON.stringify(body.dependencies);
    if (body.attachments !== undefined) updateData.attachments = typeof body.attachments === 'string' ? body.attachments : JSON.stringify(body.attachments);
    if (body.owner !== undefined) updateData.owner = body.owner;
    if (body.estimate !== undefined) updateData.estimate = body.estimate;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    updateData.updatedAt = new Date();

    const updated = await db
      .update(roadmapItems)
      .set(updateData)
      .where(eq(roadmapItems.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Roadmap item not found' }, { status: 404 });
    }
    const r = updated[0];
    return NextResponse.json({
      ...r,
      assignees: r.assignees ? JSON.parse(r.assignees) : [],
      dependencies: r.dependencies ? JSON.parse(r.dependencies) : [],
      attachments: r.attachments ? JSON.parse(r.attachments) : [],
    });
  } catch (error) {
    console.error('Error updating roadmap item:', error);
    return NextResponse.json({ error: 'Failed to update roadmap item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const deleted = await db.delete(roadmapItems).where(eq(roadmapItems.id, parseInt(id))).returning();
    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Roadmap item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting roadmap item:', error);
    return NextResponse.json({ error: 'Failed to delete roadmap item' }, { status: 500 });
  }
}
