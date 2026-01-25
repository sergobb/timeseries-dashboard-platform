import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { DataSetService } from '@/lib/services/data-set.service';
import { ChartService } from '@/lib/services/chart.service';
import { DashboardService } from '@/lib/services/dashboard.service';
import { requireAuth } from '@/lib/middleware';
import { z } from 'zod';

const preaggregationConfigSchema = z.object({
  dataSourceId: z.string(),
  interval: z.number().int().positive(),
  timeUnit: z.enum(['seconds', 'minutes', 'hours', 'days']),
});

const updateDataSetSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['combined', 'preaggregated']).optional(),
  dataSourceIds: z.array(z.string()).default([]),
  dataSetIds: z.array(z.string()).default([]),
  preaggregationConfig: z.array(preaggregationConfigSchema).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataSet = await DataSetService.getById(id);
    
    if (!dataSet) {
      return NextResponse.json({ error: 'Data set not found' }, { status: 404 });
    }

    const userRoles = session.user.roles || [];
    const hasMetadataRole = userRoles.includes('metadata_editor');
    if (!hasMetadataRole) {
      const dashboardIds = await ChartService.getDashboardIdsByDataSetId(id);
      if (dashboardIds.length === 0) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const canEditAny = await Promise.all(
        dashboardIds.map((dashboardId) => DashboardService.canEdit(dashboardId, session.user.id))
      ).then((results) => results.some(Boolean));

      if (!canEditAny) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json(dataSet);
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
    const data = updateDataSetSchema.parse(body);

    // Validate that at least one source is selected
    if (data.dataSourceIds.length === 0 && data.dataSetIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one data source or data set must be selected' },
        { status: 400 }
      );
    }

    // If multiple sources, type is required
    const totalSources = data.dataSourceIds.length + data.dataSetIds.length;
    if (totalSources > 1 && !data.type) {
      return NextResponse.json(
        { error: 'Type is required when multiple sources are selected' },
        { status: 400 }
      );
    }

    const dataSet = await DataSetService.update(
      id,
      {
        description: data.description,
        type: data.type,
        dataSourceIds: data.dataSourceIds,
        dataSetIds: data.dataSetIds,
        preaggregationConfig: data.preaggregationConfig || [],
      },
      session.user.id
    );

    if (!dataSet) {
      return NextResponse.json({ error: 'Data set not found' }, { status: 404 });
    }

    return NextResponse.json(dataSet);
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

    const deleted = await DataSetService.delete(id, session.user.id);

    if (!deleted) {
      return NextResponse.json({ error: 'Data set not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

