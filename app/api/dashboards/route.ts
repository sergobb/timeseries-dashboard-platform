import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { DashboardService } from '@/lib/services/dashboard.service';
import { requireAuth } from '@/lib/middleware';
import { z } from 'zod';

const chartConfigSchema = z.object({
  id: z.string(),
  type: z.enum(['line', 'bar', 'scatter']),
  title: z.string().min(1),
  connectionId: z.string().min(1),
  tableId: z.string().min(1),
  xAxis: z.string().min(1),
  yAxis: z.string().min(1),
  groupBy: z.string().optional(),
  filters: z.object({
    timeRange: z.object({
      from: z.string().datetime(),
      to: z.string().datetime(),
    }).optional(),
    valueFilters: z.array(z.object({
      column: z.string(),
      operator: z.enum(['eq', 'gt', 'lt', 'gte', 'lte', 'in']),
      value: z.any(),
    })).optional(),
  }).optional(),
  aggregation: z.object({
    type: z.enum(['avg', 'sum', 'min', 'max', 'count']),
    column: z.string(),
    groupBy: z.string().optional(),
  }).optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
});

const dashboardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  charts: z.array(chartConfigSchema),
  groupIds: z.array(z.string()).optional(),
  access: z.enum(['public', 'private', 'shared']),
  defaultDateRange: z.string().optional(),
  showDateRangePicker: z.boolean().optional(),
  layout: z
    .object({
      chartsPerRow: z.number().int().min(1),
    })
    .or(
      z.object({
        type: z.enum(['row', 'column', 'grid']),
      })
    )
    .optional(),
});

export async function GET() {
  try {
    const session = await auth();
    const dashboards = await DashboardService.getAll(session?.user?.id);
    return NextResponse.json(dashboards);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request, ['dashboard_creator']);
  if (authError) return authError;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = dashboardSchema.parse(body);

    const dashboard = await DashboardService.create({
      ...data,
      createdBy: session.user.id,
    });
    
    return NextResponse.json(dashboard, { status: 201 });
  } catch (_error) {
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: _error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

