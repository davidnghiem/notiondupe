import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { issues } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const issue = await db.select().from(issues).where(eq(issues.id, parseInt(id))).limit(1);
    if (issue.length === 0) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }
    const r = issue[0];
    return NextResponse.json({
      ...r,
      attachments: r.attachments ? JSON.parse(r.attachments) : [],
      customFields: r.customFields ? JSON.parse(r.customFields) : {},
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    return NextResponse.json({ error: 'Failed to fetch issue' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    const fields = ['title', 'description', 'priority', 'status', 'component', 'assignee', 'reporter', 'versionFound', 'versionFixed', 'stepsToReproduce'];
    for (const field of fields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }
    if (body.attachments !== undefined) updateData.attachments = typeof body.attachments === 'string' ? body.attachments : JSON.stringify(body.attachments);
    if (body.customFields !== undefined) updateData.customFields = typeof body.customFields === 'string' ? body.customFields : JSON.stringify(body.customFields);
    updateData.updatedAt = new Date();

    const updated = await db
      .update(issues)
      .set(updateData)
      .where(eq(issues.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }
    const r = updated[0];
    return NextResponse.json({
      ...r,
      attachments: r.attachments ? JSON.parse(r.attachments) : [],
      customFields: r.customFields ? JSON.parse(r.customFields) : {},
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const deleted = await db.delete(issues).where(eq(issues.id, parseInt(id))).returning();
    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting issue:', error);
    return NextResponse.json({ error: 'Failed to delete issue' }, { status: 500 });
  }
}
