import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { issues } from '@/lib/schema';
import { desc, eq, ilike, or, and, type SQL } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const component = searchParams.get('component');
    const assignee = searchParams.get('assignee');
    const search = searchParams.get('search');

    const conditions: SQL[] = [];
    if (priority) conditions.push(eq(issues.priority, priority));
    if (status) conditions.push(eq(issues.status, status));
    if (component) conditions.push(eq(issues.component, component));
    if (assignee) conditions.push(eq(issues.assignee, assignee));
    if (search) {
      conditions.push(
        or(
          ilike(issues.title, `%${search}%`),
          ilike(issues.description, `%${search}%`)
        )!
      );
    }

    const result = await db
      .select()
      .from(issues)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(issues.createdAt));

    const parsed = result.map((item) => ({
      ...item,
      attachments: item.attachments ? JSON.parse(item.attachments) : [],
      customFields: item.customFields ? JSON.parse(item.customFields) : {},
    }));
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newIssue = await db
      .insert(issues)
      .values({
        title: body.title,
        description: body.description,
        priority: body.priority || 'P2',
        status: body.status || 'backlog',
        component: body.component,
        assignee: body.assignee,
        reporter: body.reporter,
        versionFound: body.versionFound,
        stepsToReproduce: body.stepsToReproduce,
        attachments: body.attachments ? (typeof body.attachments === 'string' ? body.attachments : JSON.stringify(body.attachments)) : null,
        customFields: body.customFields ? (typeof body.customFields === 'string' ? body.customFields : JSON.stringify(body.customFields)) : null,
      })
      .returning();

    const issue = newIssue[0];
    return NextResponse.json({
      ...issue,
      attachments: issue.attachments ? JSON.parse(issue.attachments) : [],
      customFields: issue.customFields ? JSON.parse(issue.customFields) : {},
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}
