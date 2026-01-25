import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { DatabaseConnectionService } from '@/lib/services/db-connection.service';
import { requireAuth } from '@/lib/middleware';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  host: z.string().min(1).optional(),
  port: z.number().int().positive().optional(),
  database: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request, ['db_admin']);
  if (authError) return authError;

  try {
    const { id } = await params;
    const connection = await DatabaseConnectionService.getById(id);
    
    if (!connection) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Don't return password
    const { password, ...safeConnection } = connection;
    
    return NextResponse.json(safeConnection);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request, ['db_admin']);
  if (authError) return authError;

  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const connection = await DatabaseConnectionService.update(id, data, session.user.id);
    
    if (!connection) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Don't return password
    const { password, ...safeConnection } = connection;
    
    return NextResponse.json(safeConnection);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request, ['db_admin']);
  if (authError) return authError;

  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await DatabaseConnectionService.delete(id, session.user.id);
    
    if (!success) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

