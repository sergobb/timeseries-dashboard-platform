import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { DatabaseConnectionService } from '@/lib/services/db-connection.service';
import { requireAuth } from '@/lib/middleware';
import { z } from 'zod';

const connectionSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['postgresql', 'clickhouse']),
  host: z.string().min(1),
  port: z.number().int().positive(),
  database: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request, ['db_admin']);
  if (authError) return authError;

  try {
    const session = await auth();
    const connections = await DatabaseConnectionService.getAll(session?.user?.id);
    
    // Don't return passwords
    const safeConnections = connections.map(({ password, ...rest }) => rest);
    
    return NextResponse.json(safeConnections);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request, ['db_admin']);
  if (authError) {
    console.log('Auth error:', authError);
    return authError;
  }

  console.log('POST request received');
  try {
    const session = await auth();
    console.log('Session:', session?.user ? { id: session.user.id, email: session.user.email, roles: session.user.roles } : 'No session');
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = connectionSchema.parse(body);

    const connection = await DatabaseConnectionService.create({
      ...data,
      createdBy: session.user.id,
    });

    // Don't return password
    const { password, ...safeConnection } = connection;
    
    return NextResponse.json(safeConnection, { status: 201 });
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

