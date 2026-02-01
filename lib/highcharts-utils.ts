import { ChartType, SeriesOptions, ChartOptions, XAxisOptions, YAxis } from '@/types/chart';
import type { ColumnMetadata } from '@/types/metadata';

type HighchartsStatic = typeof import('highcharts');
type HighchartsOptions = import('highcharts').Options;
type AxisLabelsFormatterContextObject = import('highcharts').AxisLabelsFormatterContextObject;
type YAxisOptionsHighcharts = import('highcharts').YAxisOptions;
type SeriesOptionsType = import('highcharts').SeriesOptionsType;
type SeriesLineOptions = import('highcharts').SeriesLineOptions;
type SeriesSplineOptions = import('highcharts').SeriesSplineOptions;
type SeriesColumnOptions = import('highcharts').SeriesColumnOptions;
type SeriesBarOptions = import('highcharts').SeriesBarOptions;
type SeriesScatterOptions = import('highcharts').SeriesScatterOptions;
type SeriesAreaOptions = import('highcharts').SeriesAreaOptions;

export function getHighchartsChartType(chartType: ChartType): string {
  switch (chartType) {
    case 'line':
      return 'line';
    case 'bar':
      return 'column';
    case 'scatter':
      return 'scatter';
    case 'area':
      return 'area';
    default:
      return 'line';
  }
}

export function getHighchartsDashStyle(dashStyle?: string): string | undefined {
  if (!dashStyle) return undefined;
  
  const dashStyleMap: Record<string, string> = {
    Solid: 'Solid',
    ShortDash: 'ShortDash',
    ShortDot: 'ShortDot',
    ShortDashDot: 'ShortDashDot',
    ShortDashDotDot: 'ShortDashDotDot',
    Dot: 'Dot',
    Dash: 'Dash',
    LongDash: 'LongDash',
    DashDot: 'DashDot',
    LongDashDot: 'LongDashDot',
    LongDashDotDot: 'LongDashDotDot',
  };
  
  return dashStyleMap[dashStyle] || dashStyle;
}

interface SeriesData {
  columns: ColumnMetadata[];
}

interface Series {
  id: string;
  dataSetId: string;
  seriesData: SeriesData | null;
  xAxisColumn: string;
  yColumnName: string;
  yAxisId: string;
  chartType: ChartType;
  options?: SeriesOptions;
  chartData?: [number, number | null][];
}

interface ThemeColors {
  backgroundColor: string;
  textColor: string;
  textColorSecondary: string;
  textColorMuted: string;
  gridLineColor: string;
  lineColor: string;
  borderColor: string;
}

export function buildHighchartsOptions(
  series: Series[],
  yAxes: YAxis[],
  chartOptions: ChartOptions,
  xAxisOptions: XAxisOptions,
  colors: ThemeColors,
  isDark: boolean,
  dateRange: { from: Date; to: Date },
  Highcharts?: HighchartsStatic
): HighchartsOptions {
  const dateFormat = Highcharts?.dateFormat;
  const yAxisIndexById = new Map(yAxes.map((a, idx) => [a.id, idx] as const));

  const options: HighchartsOptions = {
    chart: {
      backgroundColor: chartOptions.backgroundColor || (isDark ? colors.backgroundColor : 'transparent'),
      height: chartOptions.height || null,
      plotBackgroundColor: chartOptions.plotBackgroundColor || (isDark ? colors.backgroundColor : 'transparent'),
      plotBorderWidth: chartOptions.plotBorderWidth || 0,
      plotBorderColor: chartOptions.plotBorderColor || colors.borderColor,
    },
    title: {
      text: chartOptions.title || '',
      style: chartOptions.titleStyle
        ? {
            fontSize: chartOptions.titleStyle.fontSize || '16px',
            fontWeight: chartOptions.titleStyle.fontWeight || 'bold',
            color: chartOptions.titleStyle.color || colors.textColor,
          }
        : {
            color: colors.textColor,
          },
    },
    subtitle: {
      text: chartOptions.subtitle || '',
      style: chartOptions.subtitleStyle
        ? {
            fontSize: chartOptions.subtitleStyle.fontSize || '14px',
            fontWeight: chartOptions.subtitleStyle.fontWeight || 'normal',
            color: chartOptions.subtitleStyle.color || colors.textColorSecondary,
          }
        : {
            color: colors.textColorSecondary,
          },
    },
    tooltip: {
      useHTML: true,
      backgroundColor: isDark ? colors.backgroundColor : '#ffffff',
      borderColor: colors.borderColor,
      style: {
        color: colors.textColor,
      },
      split: chartOptions.tooltip?.split ?? false,
      shared: chartOptions.tooltip?.shared ?? false,
    },
    xAxis: {
      title: {
        text: xAxisOptions.title || '',
        style: xAxisOptions.titleStyle
          ? {
              fontSize: xAxisOptions.titleStyle.fontSize || '14px',
              fontWeight: xAxisOptions.titleStyle.fontWeight || 'normal',
              color: xAxisOptions.titleStyle.color || colors.textColorSecondary,
            }
          : {
              color: colors.textColorSecondary,
            },
      },
      labels: {
        formatter: function (this: AxisLabelsFormatterContextObject) {
          const rawValue = this.value;
          const value =
            typeof rawValue === 'number'
              ? rawValue
              : typeof rawValue === 'string'
                ? Number(rawValue)
                : NaN;

          const interval = dateRange.to.getTime() - dateRange.from.getTime();
          const intervalDays = interval / (1000 * 60 * 60 * 24);
          const intervalMinutes = interval / (1000 * 60);

          if (dateFormat && Number.isFinite(value)) {
            if (intervalDays > 1 && intervalDays < 365) {
              return dateFormat('%d.%m.%Y', value);
            }
            if (intervalDays <= 1 && intervalMinutes > 2) {
              return dateFormat('%d.%m %H:%M', value);
            }
            if (intervalMinutes <= 2) {
              return dateFormat('%d.%m %H:%M:%S', value);
            }
          }

          // Fallback если Highcharts недоступен
          const date = new Date(Number.isFinite(value) ? value : Date.now());
          return date.toLocaleDateString('ru-RU');
        },
        enabled: xAxisOptions.labelsEnabled !== false,
        format: xAxisOptions.labelsFormat || '{value}',
        style: xAxisOptions.labelsStyle
          ? {
              fontSize: xAxisOptions.labelsStyle.fontSize || '12px',
              color: xAxisOptions.labelsStyle.color || colors.textColorSecondary,
            }
          : {
              color: colors.textColorSecondary,
            },
        rotation: 15,
        align: 'left',
      },
      gridLineWidth: xAxisOptions.gridLineWidth ?? 1,
      gridLineColor: colors.gridLineColor,
      lineWidth: xAxisOptions.lineWidth ?? 1,
      lineColor: colors.lineColor,
      tickWidth: xAxisOptions.tickWidth ?? 1,
      tickLength: xAxisOptions.tickLength ?? 5,
      tickPosition: xAxisOptions.tickPosition || 'outside',
      tickColor: xAxisOptions.tickColor || colors.lineColor,
      type: 'datetime',
      dateTimeLabelFormats: xAxisOptions.dateTimeLabelFormats || {
        millisecond: '%H:%M:%S.%L',
        second: '%H:%M:%S',
        minute: '%H:%M',
        hour: '%H:%M',
        day: '%e. %b',
        week: '%e. %b',
        month: '%b \'%y',
        year: '%Y',
      },
    },
    yAxis: yAxes.map((axis) => {
      const titleShift = axis.options?.titleShift;
      const opposite = axis.options?.opposite ?? false;
      const titleConfig: YAxisOptionsHighcharts['title'] = {
        text: axis.options?.title || axis.label || '',
        useHTML: true,
        style: axis.options?.titleStyle
          ? {
              fontSize: axis.options.titleStyle.fontSize || '14px',
              fontWeight: axis.options.titleStyle.fontWeight || 'normal',
              color: axis.options.titleStyle.color || colors.textColorSecondary,
            }
          : {
              color: colors.textColorSecondary,
            },
      };
      if (titleShift !== undefined && titleShift >= 0) {
        titleConfig.x = opposite ? -titleShift : titleShift;
        titleConfig.margin = titleShift + 10;
      }
      const axisOptions: YAxisOptionsHighcharts = {
        id: axis.id,
        title: titleConfig,
        labels: {
          enabled: axis.options?.labelsEnabled !== false,
          format: axis.options?.labelsFormat || '{value}',
          useHTML: true,
          style: axis.options?.labelsStyle
            ? {
                fontSize: axis.options.labelsStyle.fontSize || '12px',
                color: axis.options.labelsStyle.color || colors.textColorSecondary,
              }
            : {
                color: colors.textColorSecondary,
              },
        },
        min: axis.options?.min,
        max: axis.options?.max,
        opposite: axis.options?.opposite || false,
        gridLineWidth: axis.options?.gridLineWidth ?? 1,
        gridLineColor: colors.gridLineColor,
        lineWidth: axis.options?.lineWidth ?? 1,
        lineColor: colors.lineColor,
        tickWidth: axis.options?.tickWidth ?? 1,
        tickInterval: axis.options?.tickInterval,
        tickLength: axis.options?.tickLength ?? 5,
        tickPosition: axis.options?.tickPosition || 'outside',
        tickColor: axis.options?.tickColor || colors.lineColor,
        startOnTick: axis.options?.startOnTick ?? true,
        endOnTick: axis.options?.endOnTick ?? true,
      };

      if (axis.options?.type) {
        axisOptions.type = axis.options.type;
      }

      return axisOptions;
    }),
    series: series
      .filter((s) => s.dataSetId && s.xAxisColumn && s.yColumnName)
      .map((s) => {
        const yColumn = s.seriesData?.columns?.find((col) => col.columnName === s.yColumnName);
        const seriesName = s.options?.label?.trim() || yColumn?.description || s.yColumnName;

        const yAxisIndex = yAxisIndexById.get(s.yAxisId);
        const resolvedYAxisIndex = yAxisIndex ?? 0;

        const common = {
          name: seriesName,
          yAxis: resolvedYAxisIndex,
          xAxis: 0,
          data: s.chartData || [],
          nullInteraction: false,
          connectNulls: false,
        };

        if (s.chartType === 'line') {
          const isSpline = s.options?.lineShape === 'spline';
          const base: SeriesLineOptions | SeriesSplineOptions = {
            ...common,
            type: isSpline ? 'spline' : 'line',
          };

          if (s.options?.dashStyle) {
            base.dashStyle = getHighchartsDashStyle(s.options.dashStyle) as SeriesLineOptions['dashStyle'];
          }
          if (s.options?.lineWidth !== undefined) {
            base.lineWidth = s.options.lineWidth;
          }
          if (s.options?.color) {
            base.color = s.options.color;
          }
          if (s.options?.mode) {
            if (s.options.mode === 'markers') {
              base.lineWidth = 0;
              base.marker = { enabled: true };
            } else if (s.options.mode === 'lines+markers') {
              base.marker = { enabled: true };
            } else if (s.options.mode === 'lines') {
              base.marker = { enabled: false };
            }
          }

          return base as SeriesOptionsType;
        }

        if (s.chartType === 'bar') {
          const isHorizontal = s.options?.orientation === 'h';
          const base: SeriesBarOptions | SeriesColumnOptions = {
            ...common,
            type: isHorizontal ? 'bar' : 'column',
          };
          if (s.options?.color) base.color = s.options.color;
          return base as SeriesOptionsType;
        }

        if (s.chartType === 'scatter') {
          const base: SeriesScatterOptions = {
            ...common,
            type: 'scatter',
            marker: {
              enabled: true,
              radius: s.options?.markerSize || 4,
              symbol: s.options?.markerSymbol || 'circle',
            },
          };
          if (s.options?.color) base.color = s.options.color;
          return base as SeriesOptionsType;
        }

        const base: SeriesAreaOptions = {
          ...common,
          type: 'area',
        };
        if (s.options?.fillOpacity !== undefined) base.fillOpacity = s.options.fillOpacity;
        if (s.options?.threshold !== undefined) base.threshold = s.options.threshold;
        if (s.options?.color) base.color = s.options.color;
        return base as SeriesOptionsType;
      }),
    legend: {
      enabled: chartOptions.legendEnabled !== false,
      layout: chartOptions.legendLayout || 'horizontal',
      align: chartOptions.legendAlign || 'center',
      verticalAlign: chartOptions.legendVerticalAlign || 'bottom',
      useHTML: true,
      itemStyle: {
        color: colors.textColor,
      },
      itemHoverStyle: {
        color: colors.textColor,
      },
      itemHiddenStyle: {
        color: colors.textColorMuted,
      },
    },
    credits: {
      enabled: chartOptions.creditsEnabled !== false,
    },
  };

  return options;
}

export function getThemeColors(isDark: boolean): ThemeColors {
  if (typeof window === 'undefined') {
    return isDark
      ? {
          backgroundColor: '#18181b',
          textColor: '#f4f4f5',
          textColorSecondary: '#d4d4d8',
          textColorMuted: '#a1a1aa',
          gridLineColor: '#3f3f46',
          lineColor: '#52525b',
          borderColor: '#52525b',
        }
      : {
          backgroundColor: '#ffffff',
          textColor: '#171717',
          textColorSecondary: '#666666',
          textColorMuted: '#999999',
          gridLineColor: '#e4e4e7',
          lineColor: '#ccd6eb',
          borderColor: '#cccccc',
        };
  }

  const styles = getComputedStyle(document.documentElement);
  const getVar = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    backgroundColor: getVar('--surface', isDark ? '#18181b' : '#ffffff'),
    textColor: getVar('--foreground', isDark ? '#f4f4f5' : '#171717'),
    textColorSecondary: getVar('--muted-foreground', isDark ? '#d4d4d8' : '#666666'),
    textColorMuted: getVar('--muted-foreground', isDark ? '#a1a1aa' : '#999999'),
    gridLineColor: getVar('--border', isDark ? '#3f3f46' : '#e4e4e7'),
    lineColor: getVar('--border-muted', isDark ? '#52525b' : '#ccd6eb'),
    borderColor: getVar('--border', isDark ? '#52525b' : '#cccccc'),
  };
}

