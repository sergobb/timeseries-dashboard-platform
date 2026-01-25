import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware';
import { UserService } from '@/lib/services/user.service';

const userRoles = ['db_admin', 'metadata_editor', 'dashboard_creator', 'public', 'user_admin'] as const;

const updateRolesSchema = z.object({
  id: z.string().min(1),
  roles: z.array(z.enum(userRoles)),
});

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request, ['user_admin']);
  if (authError) return authError;

  try {
    const users = await UserService.getAllWithRoles();
    const payload = users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName || null,
      roles: user.roles || [],
    }));

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request, ['user_admin']);
  if (authError) return authError;

  try {
    const body = await request.json();
    const data = updateRolesSchema.parse(body);
    const roles = Array.from(new Set(data.roles));
    const updated = await UserService.updateRoles(data.id, roles);

    if (!updated) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: updated.id,
      roles: updated.roles || [],
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
