import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDashboard } from '@/hooks/useDashboard';
import { useDashboardCharts } from '@/hooks/useDashboardCharts';
import { useDashboardGroups } from '@/hooks/useDashboardGroups';
import { useTags } from '@/hooks/useTags';

export function useDashboardBuilder(dashboardId?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'base' | 'charts'>(() =>
    searchParams.get('tab') === 'charts' ? 'charts' : 'base'
  );

  const dashboard = useDashboard(dashboardId);
  const { tags, loading: tagsLoading, createTag } = useTags();
  const charts = useDashboardCharts(dashboardId, dashboard.dashboard?.chartIds);
  const groups = useDashboardGroups();

  const handleCancel = useCallback(() => {
    router.push('/dashboards');
  }, [router]);

  const handleRemoveChart = useCallback(
    async (chartId: string) => {
      try {
        await charts.removeChart(chartId);
        await dashboard.reloadDashboard();
      } catch {
        // Error уже обработан в хуке
      }
    },
    [dashboard.reloadDashboard, charts.removeChart]
  );

  const handleReorderCharts = useCallback(
    async (nextChartIds: string[]) => {
      try {
        await charts.reorderCharts(nextChartIds);
        await dashboard.reloadDashboard();
      } catch {
        // Error уже обработан в хуке
      }
    },
    [dashboard.reloadDashboard, charts.reorderCharts]
  );

  const handleChartsPerRowChange = useCallback(
    (next: number) => {
      dashboard.setLayout({ chartsPerRow: next });
    },
    [dashboard.setLayout]
  );

  useEffect(() => {
    if (!dashboardId) {
      setActiveTab('base');
      return;
    }
    const tab = searchParams.get('tab');
    if (tab === 'charts') setActiveTab('charts');
    else if (tab === 'base') setActiveTab('base');
  }, [dashboardId, searchParams]);

  const error = dashboard.error || charts.error;

  return {
    dashboardId,
    activeTab,
    setActiveTab,
    error,
    handleCancel,
    handleRemoveChart,
    handleReorderCharts,
    handleChartsPerRowChange,
    dashboard: dashboard.dashboard,
    title: dashboard.title,
    description: dashboard.description,
    isPublic: dashboard.isPublic,
    defaultDateRange: dashboard.defaultDateRange,
    customDateRange: dashboard.customDateRange,
    groupIds: dashboard.groupIds,
    tagIds: dashboard.tagIds,
    showDateRangePicker: dashboard.showDateRangePicker,
    layout: dashboard.layout,
    setTitle: dashboard.setTitle,
    setDescription: dashboard.setDescription,
    setIsPublic: dashboard.setIsPublic,
    setDefaultDateRange: dashboard.setDefaultDateRange,
    setCustomDateRange: dashboard.setCustomDateRange,
    toggleGroupId: dashboard.toggleGroupId,
    addTag: dashboard.addTag,
    removeTag: dashboard.removeTag,
    setShowDateRangePicker: dashboard.setShowDateRangePicker,
    setLayout: dashboard.setLayout,
    saveDashboard: dashboard.saveDashboard,
    reloadDashboard: dashboard.reloadDashboard,
    loading: dashboard.loading,
    tags,
    tagsLoading,
    createTag,
    charts: charts.charts,
    loadingCharts: charts.loadingCharts,
    removeChart: charts.removeChart,
    reorderCharts: charts.reorderCharts,
    groups: groups.groups,
    groupsLoading: groups.loading,
    groupsError: groups.error,
  };
}
