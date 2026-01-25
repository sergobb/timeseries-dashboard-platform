import { useState, useEffect, useCallback } from 'react';
import { Chart } from '@/types/chart';

interface UseDashboardChartsReturn {
  charts: Chart[];
  loadingCharts: boolean;
  loadCharts: (chartIds: string[]) => Promise<void>;
  removeChart: (chartId: string) => Promise<void>;
  reorderCharts: (nextChartIds: string[]) => Promise<void>;
  error: string;
}

export function useDashboardCharts(dashboardId?: string, chartIds?: string[]): UseDashboardChartsReturn {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [error, setError] = useState('');

  const loadCharts = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setCharts([]);
      return;
    }

    try {
      setLoadingCharts(true);
      setError('');
      const chartPromises = ids.map(id =>
        fetch(`/api/charts/${id}`, {
          credentials: 'include',
        }).then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch chart ${id}`);
          }
          return res.json();
        })
      );
      
      const chartsData = await Promise.all(chartPromises);
      setCharts(chartsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load charts');
      setCharts([]);
    } finally {
      setLoadingCharts(false);
    }
  }, []);

  useEffect(() => {
    if (chartIds && chartIds.length > 0) {
      loadCharts(chartIds);
    } else {
      setCharts([]);
    }
  }, [chartIds, loadCharts]);

  const removeChart = useCallback(async (chartId: string): Promise<void> => {
    if (!dashboardId || !chartIds) {
      throw new Error('Dashboard ID and chart IDs are required');
    }

    try {
      const updatedChartIds = chartIds.filter(id => id !== chartId);
      
      const response = await fetch(`/api/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          chartIds: updatedChartIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove chart from dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove chart');
      throw err;
    }
  }, [dashboardId, chartIds]);

  const reorderCharts = useCallback(async (nextChartIds: string[]): Promise<void> => {
    if (!dashboardId) {
      throw new Error('Dashboard ID is required');
    }

    const previousCharts = charts;
    const nextCharts = nextChartIds
      .map((id) => charts.find((chart) => chart.id === id))
      .filter((chart): chart is Chart => Boolean(chart));

    setCharts(nextCharts);

    try {
      const response = await fetch(`/api/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ chartIds: nextChartIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder charts');
      }
    } catch (err) {
      setCharts(previousCharts);
      setError(err instanceof Error ? err.message : 'Failed to reorder charts');
      throw err;
    }
  }, [charts, dashboardId]);

  return {
    charts,
    loadingCharts,
    loadCharts,
    removeChart,
    reorderCharts,
    error,
  };
}
