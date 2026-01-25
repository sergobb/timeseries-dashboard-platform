import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { DatabaseConnectionService } from '@/lib/services/db-connection.service';
import { requireAuth } from '@/lib/middleware';

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

    const schemas = await DatabaseConnectionService.listSchemas(connection);
    
    return NextResponse.json({ schemas });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

