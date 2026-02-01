import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { DatabaseConnectionService } from '@/lib/services/db-connection.service';
import { DataSourceService } from '@/lib/services/data-source.service';
import { requireAuth } from '@/lib/middleware';
import { z } from 'zod';

const addDataSourcesSchema = z.object({
  connectionId: z.string().min(1),
  tables: z.array(z.object({
    schemaName: z.string().optional(),
    tableName: z.string().min(1),
  })),
});

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request, ['metadata_editor']);
  if (authError) return authError;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all data sources
    const dataSources = await DataSourceService.getAll();
    
    return NextResponse.json(dataSources);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request, ['metadata_editor']);
  if (authError) return authError;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = addDataSourcesSchema.parse(body);

    const connection = await DatabaseConnectionService.getById(data.connectionId);
    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    const results = [];

    for (const table of data.tables) {
      // Check if data source already exists
      const existingDataSource = await DataSourceService.getByConnectionAndTable(
        data.connectionId,
        table.tableName,
        table.schemaName
      );

      // Get table columns
      const columns = await DatabaseConnectionService.getTableColumns(
        connection,
        table.tableName,
        table.schemaName
      );

      // Convert columns to ColumnMetadata format
      type DbColumn = { column_name: string; data_type: string };
      const columnMetadata = (columns as DbColumn[]).map((col) => ({
        columnName: col.column_name,
        dataType: col.data_type,
        description: '',
        active: true, // по умолчанию все колонки активны
      }));

      if (existingDataSource) {
        // Update existing data source, but preserve existing column active states
        const existingColumnsMap = new Map(
          existingDataSource.columns.map(col => [col.columnName, col])
        );
        const mergedColumns = columnMetadata.map(newCol => {
          const existingCol = existingColumnsMap.get(newCol.columnName);
          return {
            ...newCol,
            description: existingCol?.description || newCol.description,
            active: existingCol?.active !== undefined ? existingCol.active : true,
            // Preserve other metadata fields
            unit: existingCol?.unit,
            minValue: existingCol?.minValue,
            maxValue: existingCol?.maxValue,
            format: existingCol?.format,
            customFields: existingCol?.customFields,
          };
        });
        
        const updated = await DataSourceService.update(
          existingDataSource.id,
          {
            columns: mergedColumns,
          },
          session.user.id,
          { ignoreOwnership: true }
        );
        if (updated) {
          results.push(updated);
        }
      } else {
        // Create new data source
        const dataSource = await DataSourceService.create({
          connectionId: data.connectionId,
          tableName: table.tableName,
          schemaName: table.schemaName,
          description: '',
          columns: columnMetadata,
          createdBy: session.user.id,
        });
        results.push(dataSource);
      }
    }

    return NextResponse.json({ dataSources: results }, { status: 201 });
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
