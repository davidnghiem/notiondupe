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

    return NextResponse.json(result);
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
        status: body.status || 'new',
        component: body.component,
        assignee: body.assignee,
        reporter: body.reporter,
        versionFound: body.versionFound,
        stepsToReproduce: body.stepsToReproduce,
      })
      .returning();

    return NextResponse.json(newIssue[0], { status: 201 });
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}
