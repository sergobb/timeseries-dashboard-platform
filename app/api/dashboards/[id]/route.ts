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
  filters: z.any().optional(),
  aggregation: z.any().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
});

const updateDashboardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  charts: z.array(chartConfigSchema).optional(),
  chartIds: z.array(z.string()).optional(),
  groupIds: z.array(z.string()).optional(),
  access: z.enum(['public', 'private', 'shared']).optional(),
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const dashboard = await DashboardService.getById(id, session?.user?.id);
    
    if (!dashboard) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(dashboard);
  } catch {
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
  const authError = await requireAuth(request, ['dashboard_creator']);
  if (authError) return authError;

  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = updateDashboardSchema.parse(body);

    const dashboard = await DashboardService.update(id, data, session.user.id);
    
    if (!dashboard) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(dashboard);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request, ['dashboard_creator']);
  if (authError) return authError;

  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await DashboardService.delete(id, session.user.id);
    
    if (!success) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

