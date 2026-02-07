import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { ChartService } from '@/lib/services/chart.service';
import { DashboardService } from '@/lib/services/dashboard.service';
import { requireAuth } from '@/lib/middleware';
import { z } from 'zod';
import { ChartType } from '@/types/chart';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const dashboardId = searchParams.get('dashboardId');

    if (dashboardId) {
      const dashboard = await DashboardService.getById(dashboardId, session?.user?.id);
      if (!dashboard) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const charts = await ChartService.getByDashboardId(dashboardId);
      return NextResponse.json(charts);
    }

    // Если dashboardId не указан, возвращаем все чарты
    const charts = await ChartService.getAll(session?.user?.id);
    return NextResponse.json(charts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

const seriesOptionsSchema = z.object({
  label: z.string().optional(),
  mode: z.enum(['lines', 'markers', 'lines+markers', 'text']).optional(),
  lineShape: z.enum(['linear', 'spline', 'hv', 'vh', 'hvh', 'vhv']).optional(),
  dashStyle: z
    .enum([
      'Solid',
      'ShortDash',
      'ShortDot',
      'ShortDashDot',
      'ShortDashDotDot',
      'Dot',
      'Dash',
      'LongDash',
      'DashDot',
      'LongDashDot',
      'LongDashDotDot',
    ])
    .optional(),
  lineWidth: z.number().optional(),
  color: z.string().optional(),
  orientation: z.enum(['v', 'h']).optional(),
  markerColor: z.string().optional(),
  textPosition: z.enum(['none', 'inside', 'outside', 'auto']).optional(),
  width: z.number().optional(),
  markerSize: z.number().optional(),
  markerSymbol: z.string().optional(),
  fillOpacity: z.number().optional(),
  threshold: z.number().optional(),
});

const yAxisOptionsSchema = z.object({
  type: z.enum(['linear', 'logarithmic']).optional(),
  title: z.string().optional(),
  titleStyle: z.object({
    fontSize: z.string().optional(),
    fontWeight: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
  labelsEnabled: z.boolean().optional(),
  titleShift: z.number().int().min(0).optional(),
  labelsFormat: z.string().optional(),
  labelsStyle: z.object({
    fontSize: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  opposite: z.boolean().optional(),
  gridLineWidth: z.number().optional(),
  lineWidth: z.number().optional(),
  tickWidth: z.number().optional(),
  tickInterval: z.number().optional(),
  tickLength: z.number().optional(),
  tickPosition: z.enum(['inside', 'outside']).optional(),
  tickColor: z.string().optional(),
  startOnTick: z.boolean().optional(),
  endOnTick: z.boolean().optional(),
});

const chartOptionsSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  title: z.string().optional(),
  titleStyle: z.object({
    fontSize: z.string().optional(),
    fontWeight: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
  subtitle: z.string().optional(),
  subtitleStyle: z.object({
    fontSize: z.string().optional(),
    fontWeight: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
  legendEnabled: z.boolean().optional(),
  legendLayout: z.enum(['horizontal', 'vertical']).optional(),
  legendAlign: z.enum(['left', 'center', 'right']).optional(),
  legendVerticalAlign: z.enum(['top', 'middle', 'bottom']).optional(),
  creditsEnabled: z.boolean().optional(),
  backgroundColor: z.string().optional(),
  height: z.number().optional(),
  spaceLeft: z.number().optional(),
  spaceRight: z.number().optional(),
  plotBackgroundColor: z.string().optional(),
  plotBorderWidth: z.number().optional(),
  plotBorderColor: z.string().optional(),
  tooltip: z.object({
    split: z.boolean().optional(),
    shared: z.boolean().optional(),
  }).optional(),
});

const xAxisOptionsSchema = z.object({
  title: z.string().optional(),
  titleStyle: z.object({
    fontSize: z.string().optional(),
    fontWeight: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
  labelsEnabled: z.boolean().optional(),
  labelsFormat: z.string().optional(),
  labelsStyle: z.object({
    fontSize: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
  gridLineWidth: z.number().optional(),
  lineWidth: z.number().optional(),
  tickWidth: z.number().optional(),
  tickLength: z.number().optional(),
  tickPosition: z.enum(['inside', 'outside']).optional(),
  tickColor: z.string().optional(),
  dateTimeLabelFormats: z.object({
    millisecond: z.string().optional(),
    second: z.string().optional(),
    minute: z.string().optional(),
    hour: z.string().optional(),
    day: z.string().optional(),
    week: z.string().optional(),
    month: z.string().optional(),
    year: z.string().optional(),
  }).optional(),
});

const seriesSchema = z.object({
  id: z.string(),
  dataSetId: z.string().min(1, 'Data set is required'),
  xAxisColumn: z.string().min(1, 'X axis column is required'),
  yColumnName: z.string().min(1, 'Y column is required'),
  yAxisId: z.string().min(1, 'Y axis is required'),
  chartType: z.enum(['line', 'bar', 'scatter', 'area']),
  options: seriesOptionsSchema.optional(),
});

const yAxisSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Label is required'),
  options: yAxisOptionsSchema.optional(),
});

const createChartSchema = z.object({
  dashboardId: z.string().min(1, 'Dashboard ID is required'),
  series: z.array(seriesSchema).min(1, 'At least one series is required'),
  yAxes: z.array(yAxisSchema).min(1, 'At least one Y axis is required'),
  chartOptions: chartOptionsSchema,
  xAxisOptions: xAxisOptionsSchema.optional(),
});

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request, ['dashboard_creator']);
  if (authError) return authError;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createChartSchema.parse(body);

    // Проверяем, что dashboard существует и принадлежит пользователю
    const dashboard = await DashboardService.getById(data.dashboardId, session.user.id);
    if (!dashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    // Создаем chart
    const chart = await ChartService.create({
      dashboardId: data.dashboardId,
      series: data.series,
      yAxes: data.yAxes,
      chartOptions: data.chartOptions,
      xAxisOptions: data.xAxisOptions || {},
      createdBy: session.user.id,
    });

    // Добавляем chartId в dashboard
    const chartIds = dashboard.chartIds || [];
    if (!chartIds.includes(chart.id)) {
      await DashboardService.update(
        data.dashboardId,
        { chartIds: [...chartIds, chart.id] },
        session.user.id
      );
    }

    return NextResponse.json(chart, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating chart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

