import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { DatabaseConnectionService } from '@/lib/services/db-connection.service';
import { requireAuth } from '@/lib/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; schema: string }> }
) {
  const authError = await requireAuth(request, ['db_admin']);
  if (authError) return authError;

  try {
    const { id, schema } = await params;
    const connection = await DatabaseConnectionService.getById(id);
    
    if (!connection) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // For ClickHouse, schema is empty, so we list all tables
    // For PostgreSQL, decode the schema name
    const schemaName = connection.type === 'clickhouse' ? '' : (schema === 'default' ? 'public' : decodeURIComponent(schema));
    const tables = await DatabaseConnectionService.listTablesBySchema(connection, schemaName);
    
    return NextResponse.json({ tables });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

