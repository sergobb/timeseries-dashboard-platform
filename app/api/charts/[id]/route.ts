import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { ChartService } from '@/lib/services/chart.service';
import { DashboardService } from '@/lib/services/dashboard.service';
import { requireAuth } from '@/lib/middleware';
import { z } from 'zod';

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

const updateChartSchema = z.object({
  series: z.array(seriesSchema).min(1, 'At least one series is required'),
  yAxes: z.array(yAxisSchema).min(1, 'At least one Y axis is required'),
  chartOptions: chartOptionsSchema,
  xAxisOptions: xAxisOptionsSchema.optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const chart = await ChartService.getById(id);
    
    if (!chart) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const dashboard = await DashboardService.getById(chart.dashboardId, session?.user?.id);
    if (!dashboard) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(chart);
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
  const authError = await requireAuth(request, ['dashboard_creator']);
  if (authError) return authError;

  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingChart = await ChartService.getById(id);
    if (!existingChart) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const canEdit = await DashboardService.canEdit(existingChart.dashboardId, session.user.id);
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateChartSchema.parse(body);

    const chart = await ChartService.updateById(id, {
      series: data.series,
      yAxes: data.yAxes,
      chartOptions: data.chartOptions,
      xAxisOptions: data.xAxisOptions || {},
    });

    if (!chart) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(chart);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating chart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

