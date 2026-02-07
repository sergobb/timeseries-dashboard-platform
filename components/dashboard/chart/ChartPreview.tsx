'use client';

import { useMemo, useEffect, useState } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import Box from '@/components/ui/Box';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import DateRangePicker from '@/components/dashboard/DateRangePicker';
import { buildHighchartsOptions, getThemeColors } from '@/lib/highcharts-utils';
import { Series } from './hooks/useChartBuilder';
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
  const [themeColors, setThemeColors] = useState(() => getThemeColors(isDark));

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setThemeColors(getThemeColors(isDark));
    });
    return () => cancelAnimationFrame(id);
  }, [theme, isDark]);

  const colors = useMemo(() => themeColors, [themeColors]);
  
  const highchartsOptions = useMemo(() => {
    return buildHighchartsOptions(series, yAxes, chartOptions, xAxisOptions, colors, isDark, dateRange, Highcharts);
  }, [series, yAxes, chartOptions, xAxisOptions, colors, isDark, dateRange]);

  return (
    <Card className="p-6">
      <Text size="lg" className="mb-4 font-semibold">
        Chart Preview
      </Text>
      <DateRangePicker value={dateRange} onRangeChange={onRangeChange} />
      <Box className="w-full rounded p-4">
        <HighchartsReact
          highcharts={Highcharts}
          options={highchartsOptions}
          containerProps={{ style: { width: '100%' } }}
        />
      </Box>
    </Card>
  );
}

