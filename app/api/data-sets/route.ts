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

const createDataSetSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['combined', 'preaggregated']).optional(),
  dataSourceIds: z.array(z.string()).default([]),
  dataSetIds: z.array(z.string()).default([]),
  preaggregationConfig: z.array(preaggregationConfigSchema).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRoles = session.user.roles || [];
    const hasMetadataRole = userRoles.includes('metadata_editor');

    if (hasMetadataRole) {
      const dataSets = await DataSetService.getAll(session.user.id);
      return NextResponse.json(dataSets);
    }

    const dashboards = await DashboardService.getAll(session.user.id);
    const editableDashboardIds = dashboards
      .filter((dashboard) => dashboard.canEdit)
      .map((dashboard) => dashboard.id);

    const dataSetIds = await ChartService.getDataSetIdsByDashboardIds(editableDashboardIds);
    const dataSets = await DataSetService.getByIds(dataSetIds);
    
    return NextResponse.json(dataSets);
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
    const data = createDataSetSchema.parse(body);

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

    const dataSet = await DataSetService.create({
      description: data.description,
      type: data.type,
      dataSourceIds: data.dataSourceIds,
      dataSetIds: data.dataSetIds,
      preaggregationConfig: data.preaggregationConfig || [],
      createdBy: session.user.id,
    });

    return NextResponse.json(dataSet, { status: 201 });
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

