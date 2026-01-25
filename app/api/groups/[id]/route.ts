import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { requireAuth } from '@/lib/middleware';
import { GroupService } from '@/lib/services/group.service';
import { z } from 'zod';

const groupUpdateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  role: z.enum(['view', 'edit']),
  memberIds: z.array(z.string().min(1)).default([]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const group = await GroupService.getById(id, session.user.id);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = groupUpdateSchema.parse(body);
    const memberIds = Array.from(new Set(data.memberIds));

    const group = await GroupService.update(id, session.user.id, {
      name: data.name.trim(),
      description: data.description.trim(),
      role: data.role,
      memberIds,
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await GroupService.delete(id, session.user.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
