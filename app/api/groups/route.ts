import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { requireAuth } from '@/lib/middleware';
import { GroupService } from '@/lib/services/group.service';
import { z } from 'zod';

const groupSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  role: z.enum(['view', 'edit']),
  memberIds: z.array(z.string().min(1)).default([]),
});

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groups = await GroupService.getByOwner(session.user.id);
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = groupSchema.parse(body);
    const memberIds = Array.from(new Set(data.memberIds));

    const group = await GroupService.create({
      name: data.name.trim(),
      description: data.description.trim(),
      role: data.role,
      memberIds,
      owner: session.user.id,
      createdBy: session.user.id,
    });

    return NextResponse.json(group, { status: 201 });
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
