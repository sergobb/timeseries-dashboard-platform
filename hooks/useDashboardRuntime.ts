import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { PRESET_RANGES } from '@/lib/date-ranges';
import type { Chart } from '@/types/chart';
import type { Dashboard } from '@/types/dashboard';

export type DashboardChartSeriesWithData = {
  id: string;
  dataSetId: string;
  seriesData: null;
  xAxisColumn: string;
  yColumnName: string;
  yAxisId: string;
  chartType: Chart['series'][number]['chartType'];
  options?: Chart['series'][number]['options'];
  chartData: [number, number | null][];
};

export type UseDashboardRuntimeResult = {
  charts: Chart[];
  seriesByChartId: Record<string, DashboardChartSeriesWithData[]>;
  seriesLoadingByChartId: Record<string, boolean>;
  dateRange: { from: Date; to: Date };
  setDateRange: Dispatch<SetStateAction<{ from: Date; to: Date }>>;
  loading: boolean;
  error: string | null;
};

function getInitialDateRange(defaultDateRange?: string) {
  const preset = PRESET_RANGES.find((p) => p.label === (defaultDateRange || 'Last 7 Days'));
  const fallback = PRESET_RANGES.find((p) => p.label === 'Last 7 Days');
  return (preset || fallback)?.getRange() || { from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() };
}

export function useDashboardRuntime(dashboard: Dashboard): UseDashboardRuntimeResult {
  const chartIdsKey = useMemo(() => (dashboard.chartIds || []).join('|'), [dashboard.chartIds]);

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() =>
    getInitialDateRange(dashboard.defaultDateRange)
  );
  const [charts, setCharts] = useState<Chart[]>([]);
  const [seriesByChartId, setSeriesByChartId] = useState<Record<string, DashboardChartSeriesWithData[]>>({});
  const [loading, setLoading] = useState(true);
  const [seriesLoadingByChartId, setSeriesLoadingByChartId] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const loadCharts = useCallback(async (): Promise<Chart[]> => {
    const ids = dashboard.chartIds || [];
    if (ids.length === 0) return [];

    return await Promise.all(
      ids.map(async (id) => {
        const res = await fetch(`/api/charts/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`Failed to load chart ${id}`);
        return (await res.json()) as Chart;
      })
    );
  }, [chartIdsKey, dashboard.chartIds]);

  const loadChartSeriesData = useCallback(
    async (chart: Chart): Promise<DashboardChartSeriesWithData[]> => {
      return await Promise.all(
        chart.series.map(async (s) => {
          const response = await fetch('/api/data/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              dataSetId: s.dataSetId,
              xColumnName: s.xAxisColumn,
              yColumnName: s.yColumnName,
              dateRange,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error((errorData as { error?: string }).error || `Failed to load data for series ${s.id}`);
          }

          const result = await response.json();
          const rows = ((result as { data?: Array<Record<string, unknown>> }).data || []) as Array<Record<string, unknown>>;
          const chartData: [number, number | null][] = rows
            .map((row) => {
              const xValue = row[s.xAxisColumn];
              const yValue = row[s.yColumnName];

              let timestamp: number;
              if (xValue instanceof Date) timestamp = xValue.getTime();
              else if (typeof xValue === 'string') timestamp = new Date(xValue).getTime();
              else if (typeof xValue === 'number') timestamp = xValue;
              else timestamp = Date.parse(String(xValue));

              // Преобразуем yValue в число, сохраняя null значения
              let numValue: number | null;
              if (yValue === null || yValue === undefined) {
                numValue = null;
              } else if (typeof yValue === 'number') {
                numValue = yValue;
              } else {
                const parsed = parseFloat(String(yValue));
                numValue = isNaN(parsed) ? null : parsed;
              }
              return [timestamp, numValue] as [number, number | null];
            })
            .sort((a, b) => a[0] - b[0]);

          return {
            id: s.id,
            dataSetId: s.dataSetId,
            seriesData: null,
            xAxisColumn: s.xAxisColumn,
            yColumnName: s.yColumnName,
            yAxisId: s.yAxisId,
            chartType: s.chartType,
            options: s.options,
            chartData,
          };
        })
      );
    },
    [dateRange]
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const loadedCharts = await loadCharts();
      setCharts(loadedCharts);
      setSeriesByChartId(Object.fromEntries(loadedCharts.map((chart) => [chart.id, []])));
      setSeriesLoadingByChartId(Object.fromEntries(loadedCharts.map((chart) => [chart.id, true])));
      setLoading(false);

      void Promise.allSettled(
        loadedCharts.map(async (chart) => {
          try {
            const series = await loadChartSeriesData(chart);
            setSeriesByChartId((prev) => ({ ...prev, [chart.id]: series }));
          } catch (err) {
            setSeriesByChartId((prev) => ({ ...prev, [chart.id]: [] }));
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
          } finally {
            setSeriesLoadingByChartId((prev) => ({ ...prev, [chart.id]: false }));
          }
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      setCharts([]);
      setSeriesByChartId({});
      setSeriesLoadingByChartId({});
    } finally {
      setLoading(false);
    }
  }, [loadChartSeriesData, loadCharts]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    charts,
    seriesByChartId,
    seriesLoadingByChartId,
    dateRange,
    setDateRange,
    loading,
    error,
  };
}

