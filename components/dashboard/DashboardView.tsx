'use client';

import { useMemo, useEffect, useState } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { useTheme } from '@/components/providers/ThemeProvider';
import Box from '@/components/ui/Box';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import DateRangePicker from '@/components/dashboard/DateRangePicker';
import { normalizeDashboardLayout } from '@/lib/dashboard-layout';
import { buildHighchartsOptions, getThemeColors } from '@/lib/highcharts-utils';
import { useDashboardRuntime, type UseDashboardRuntimeResult } from '@/hooks/useDashboardRuntime';
import type { Dashboard } from '@/types/dashboard';

export default function DashboardView({ dashboard }: { dashboard: Dashboard }) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [themeColors, setThemeColors] = useState(() => getThemeColors(isDark));

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setThemeColors(getThemeColors(isDark));
    });
    return () => cancelAnimationFrame(id);
  }, [theme, isDark]);

  const colors = useMemo(() => themeColors, [themeColors]);
  const { charts, seriesByChartId, seriesLoadingByChartId, dateRange, setDateRange, loading, error } =
    useDashboardRuntime(dashboard) as UseDashboardRuntimeResult;
  const showDateRangePicker = dashboard.showDateRangePicker ?? true;

  if (loading && charts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[var(--color-muted-foreground)]">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (charts.length === 0) {
    return (
      <Card className="p-6">
        <Text variant="muted">No charts added yet.</Text>
      </Card>
    );
  }

  const { chartsPerRow } = normalizeDashboardLayout(dashboard.layout, charts.length);
  const columns = Math.max(1, chartsPerRow);
  const containerClassName = 'grid gap-6';
  const containerStyle = {
    gridTemplateColumns: `repeat(${columns}, minmax(320px, 1fr))`,
    overflowX: 'auto' as const,
  };

  return (
    <Box className="space-y-4">
      {showDateRangePicker && (
        <DateRangePicker
          value={dateRange}
          onRangeChange={(r) => r && setDateRange(r)}
        />
      )}

      <div className={containerClassName} style={containerStyle}>
        {charts.map((chart) => {
          const series = seriesByChartId[chart.id] || [];
          const options = buildHighchartsOptions(
            series,
            chart.yAxes,
            chart.chartOptions,
            chart.xAxisOptions,
            colors,
            isDark,
            dateRange,
            Highcharts
          );

          const title = chart.chartOptions.description || chart.chartOptions.title || 'Untitled Chart';

          return (
            <Card key={chart.id} className="p-6 min-w-[320px]">
              {seriesLoadingByChartId[chart.id] && series.length === 0 && (
                <Text variant="muted" className="mb-3">
                  Loading data...
                </Text>
              )}
              <HighchartsReact
                key={`${chart.id}-${theme}`}
                highcharts={Highcharts}
                options={options}
                containerProps={{ style: { width: '100%' } }}
              />
            </Card>
          );
        })}
      </div>
    </Box>
  );
}

