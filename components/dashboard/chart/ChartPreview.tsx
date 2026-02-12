'use client';

import { useMemo, useEffect, useState } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import DateRangePicker from '@/components/dashboard/DateRangePicker';
import { buildHighchartsOptions, getThemeColors } from '@/lib/highcharts-utils';
import { Series } from '@/hooks/useChartBuilder';
import { YAxis, ChartOptions, XAxisOptions } from '@/types/chart';

interface ChartPreviewProps {
  series: Series[];
  yAxes: YAxis[];
  chartOptions: ChartOptions;
  xAxisOptions: XAxisOptions;
  dateRange: { from: Date; to: Date };
  onRangeChange: (range: { from: Date; to: Date } | null) => void;
  isDark: boolean;
  /** Полное имя темы (light/dark/light-blue/dark-blue); нужно чтобы фон чарта обновлялся при смене dark↔dark-blue */
  theme: string;
}

export default function ChartPreview({
  series,
  yAxes,
  chartOptions,
  xAxisOptions,
  dateRange,
  onRangeChange,
  isDark,
  theme,
}: ChartPreviewProps) {
  const [themeColors, setThemeColors] = useState(() =>
    getThemeColors(theme as 'light' | 'dark' | 'light-blue' | 'dark-blue')
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setThemeColors(
        getThemeColors(theme as 'light' | 'dark' | 'light-blue' | 'dark-blue')
      );
    });
    return () => cancelAnimationFrame(id);
  }, [theme, isDark]);

  const colors = useMemo(() => themeColors, [themeColors]);

  // Превью использует те же опции, что и дашборд: series, yAxes (в т.ч. min/max оси Y), chartOptions, xAxisOptions
  const highchartsOptions = useMemo(() => {
    return buildHighchartsOptions(series, yAxes, chartOptions, xAxisOptions, colors, isDark, dateRange, Highcharts);
  }, [series, yAxes, chartOptions, xAxisOptions, colors, isDark, dateRange]);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-[var(--color-border-muted)] px-4 py-3">
        <Text size="sm" className="font-display font-semibold text-[var(--color-foreground)]">
          Chart Preview
        </Text>
      </div>
      <div className="p-4 space-y-4 flex-1 min-h-0">
        <DateRangePicker value={dateRange} onRangeChange={onRangeChange} />
        <Box className="w-full rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border-muted)] p-4 min-h-[280px]">
          <HighchartsReact
            highcharts={Highcharts}
            options={highchartsOptions}
            containerProps={{ style: { width: '100%' } }}
          />
        </Box>
      </div>
    </div>
  );
}

