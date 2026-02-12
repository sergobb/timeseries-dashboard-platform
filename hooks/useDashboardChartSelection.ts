import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Chart } from '@/types/chart';
import type { Dashboard } from '@/types/dashboard';

export interface UseDashboardChartSelectionReturn {
  dashboard: Dashboard | null;
  charts: Chart[];
  selectedChartIds: Set<string>;
  filterText: string;
  loading: boolean;
  saving: boolean;
  error: string;
  filteredCharts: Chart[];
  setFilterText: (value: string) => void;
  toggleChart: (chartId: string) => void;
  addChartsToDashboard: () => Promise<void>;
  isChartInDashboard: (chartId: string) => boolean;
  isChartSelected: (chartId: string) => boolean;
  goBack: () => void;
}

export function useDashboardChartSelection(dashboardId: string): UseDashboardChartSelectionReturn {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [selectedChartIds, setSelectedChartIds] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [dashboardRes, chartsRes] = await Promise.all([
        fetch(`/api/dashboards/${dashboardId}`, { credentials: 'include' }),
        fetch('/api/charts', { credentials: 'include' }),
      ]);
      if (!dashboardRes.ok) throw new Error('Failed to load dashboard');
      if (!chartsRes.ok) throw new Error('Failed to load charts');
      const [dashboardData, chartsData] = await Promise.all([dashboardRes.json(), chartsRes.json()]);
      setDashboard(dashboardData);
      setCharts(chartsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [dashboardId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleChart = useCallback((chartId: string) => {
    setSelectedChartIds((prev) => {
      const next = new Set(prev);
      if (next.has(chartId)) next.delete(chartId);
      else next.add(chartId);
      return next;
    });
  }, []);

  const isChartInDashboard = useCallback(
    (chartId: string) => dashboard?.chartIds?.includes(chartId) ?? false,
    [dashboard?.chartIds]
  );

  const isChartSelected = useCallback((chartId: string) => selectedChartIds.has(chartId), [selectedChartIds]);

  const addChartsToDashboard = useCallback(async () => {
    if (selectedChartIds.size === 0) return;
    try {
      setSaving(true);
      setError('');
      const currentChartIds = dashboard?.chartIds ?? [];
      const newChartIds = Array.from(new Set([...currentChartIds, ...selectedChartIds]));
      const response = await fetch(`/api/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ chartIds: newChartIds }),
      });
      if (!response.ok) throw new Error('Failed to add charts to dashboard');
      router.push(`/dashboards/${dashboardId}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add charts');
    } finally {
      setSaving(false);
    }
  }, [dashboardId, dashboard?.chartIds, selectedChartIds, router]);

  const goBack = useCallback(() => router.back(), [router]);

  const filteredCharts = charts.filter((chart) => {
    const description = chart.chartOptions?.description || chart.chartOptions?.title || '';
    return description.toLowerCase().includes(filterText.toLowerCase());
  });

  return {
    dashboard,
    charts,
    selectedChartIds,
    filterText,
    loading,
    saving,
    error,
    filteredCharts,
    setFilterText,
    toggleChart,
    addChartsToDashboard,
    isChartInDashboard,
    isChartSelected,
    goBack,
  };
}
