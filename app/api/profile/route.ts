import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { UserService } from '@/lib/services/user.service';

const profileUpdateSchema = z.object({
  lastName: z.string().trim().min(1).max(100),
  firstName: z.string().trim().min(1).max(100),
  middleName: z.string().trim().max(100).nullable().optional(),
  organization: z.string().trim().max(200).nullable().optional(),
  department: z.string().trim().max(200).nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await UserService.getById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName ?? null,
    organization: user.organization ?? null,
    department: user.department ?? null,
    roles: user.roles,
  });
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.parse(body);

    const user = await UserService.updateProfile(session.user.id, {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      middleName: parsed.middleName ?? null,
      organization: parsed.organization ?? null,
      department: parsed.department ?? null,
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName ?? null,
      organization: user.organization ?? null,
      department: user.department ?? null,
      roles: user.roles,
    });
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
