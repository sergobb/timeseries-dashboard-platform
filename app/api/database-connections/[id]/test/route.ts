import { NextRequest, NextResponse } from 'next/server';
import { DatabaseConnectionService } from '@/lib/services/db-connection.service';
import { requireAuth } from '@/lib/middleware';

export async function POST(
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

    const isValid = await DatabaseConnectionService.testConnection(connection);
    
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', valid: false },
      { status: 500 }
    );
  }
}

