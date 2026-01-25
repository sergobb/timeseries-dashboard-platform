import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { DatabaseConnectionService } from '@/lib/services/db-connection.service';
import { requireAuth } from '@/lib/middleware';
import { z } from 'zod';

const selectTableSchema = z.object({
  tableName: z.string().min(1),
  schemaName: z.string().optional(),
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

    const tables = await DatabaseConnectionService.listTables(connection);
    
    return NextResponse.json({ tables });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST method removed - use /api/data-sources instead

