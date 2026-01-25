import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { DataSourceService } from '@/lib/services/data-source.service';
import { requireAuth } from '@/lib/middleware';
import { z } from 'zod';

const columnMetadataSchema = z.object({
  columnName: z.string().min(1),
  dataType: z.string().min(1),
  description: z.string().optional(),
  unit: z.string().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  format: z.string().optional(),
  customFields: z.record(z.string(), z.any()).optional(),
});

const metadataSchema = z.object({
  connectionId: z.string().min(1),
  tableName: z.string().min(1),
  schemaName: z.string().optional(),
  description: z.string().optional(),
  columns: z.array(columnMetadataSchema),
});

export async function GET(request: NextRequest) {
  try {
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
    const data = metadataSchema.parse(body);

    const dataSource = await DataSourceService.create({
      ...data,
      createdBy: session.user.id,
    });
    
    return NextResponse.json(dataSource, { status: 201 });
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
