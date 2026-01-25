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
  active: z.boolean().optional(),
  customFields: z.record(z.string(), z.any()).optional(),
});

const updateDataSourceSchema = z.object({
  description: z.string().optional(),
  columns: z.array(columnMetadataSchema).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request, ['metadata_editor']);
  if (authError) return authError;

  try {
    const { id } = await params;
    const dataSource = await DataSourceService.getById(id);
    
    if (!dataSource) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(dataSource);
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
  const authError = await requireAuth(request, ['metadata_editor']);
  if (authError) return authError;

  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = updateDataSourceSchema.parse(body);

    const dataSource = await DataSourceService.update(id, data, session.user.id);
    
    if (!dataSource) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(dataSource);
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
  const authError = await requireAuth(request, ['metadata_editor']);
  if (authError) return authError;

  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await DataSourceService.delete(id, session.user.id);
    
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

