import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { TagService } from '@/lib/services/tag.service';
import { z } from 'zod';

const createTagSchema = z.object({ name: z.string().min(1).max(100) });

function canAddTags(roles: string[]): boolean {
  if (!roles.length) return false;
  return roles.some((r) => r !== 'public') || roles.length > 1;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tags = await TagService.getAll();
    return NextResponse.json(tags);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roles = session.user.roles ?? [];
    if (!canAddTags(roles)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Public role cannot add tags.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name } = createTagSchema.parse(body);

    const tag = await TagService.create(name);
    return NextResponse.json(tag, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
