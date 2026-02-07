'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import Button from '@/components/ui/Button';
import Flex from '@/components/ui/Flex';
import Box from '@/components/ui/Box';
import PageHeader from '@/components/ui/PageHeader';
import PageTitle from '@/components/ui/PageTitle';
import Tabs, { type TabsItem } from '@/components/ui/Tabs';
import DashboardForm from './DashboardForm';
import DashboardChartsSection from './DashboardChartsSection';
import DashboardLayoutSelector from './DashboardLayoutSelector';
import { useDashboard } from './hooks/useDashboard';
import { useDashboardCharts } from './hooks/useDashboardCharts';
import { useDashboardGroups } from './hooks/useDashboardGroups';

interface DashboardBuilderProps {
  dashboardId?: string;
}

export default function DashboardBuilder({ dashboardId }: DashboardBuilderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'base' | 'charts'>(() =>
    searchParams.get('tab') === 'charts' ? 'charts' : 'base'
  );
  const {
    dashboard,
    title,
    description,
    isPublic,
    defaultDateRange,
    groupIds,
    showDateRangePicker,
    layout,
    setTitle,
    setDescription,
    setIsPublic,
    setDefaultDateRange,
    toggleGroupId,
    setShowDateRangePicker,
    setLayout,
    saveDashboard,
    reloadDashboard,
    loading,
    error: dashboardError,
  } = useDashboard(dashboardId);

  const {
    charts,
    loadingCharts,
    removeChart,
    reorderCharts,
    error: chartsError,
  } = useDashboardCharts(dashboardId, dashboard?.chartIds);

  const {
    groups,
    loading: groupsLoading,
    error: groupsError,
  } = useDashboardGroups();

  const handleCancel = () => {
    router.push('/dashboards');
  };

  const handleRemoveChart = useCallback(async (chartId: string) => {
    try {
      await removeChart(chartId);
      await reloadDashboard();
    } catch {
      // Error уже обработан в хуке
    }
  }, [reloadDashboard, removeChart]);

  const handleReorderCharts = useCallback(async (nextChartIds: string[]) => {
    try {
      await reorderCharts(nextChartIds);
      await reloadDashboard();
    } catch {
      // Error уже обработан в хуке
    }
  }, [reloadDashboard, reorderCharts]);

  const handleChartsPerRowChange = useCallback((next: number) => {
    setLayout({ chartsPerRow: next });
  }, [setLayout]);

  const error = dashboardError || chartsError;

  const chartCount = charts.length;
  const tabs = useMemo<TabsItem[]>(() => {
    const canManageCharts = Boolean(dashboardId);

    const baseTab: TabsItem = {
        value: 'base',
        label: 'General',
        content: (
          <Box className="space-y-6">
            <DashboardForm
              title={title}
              description={description}
              isPublic={isPublic}
              defaultDateRange={defaultDateRange}
              groups={groups}
              selectedGroupIds={groupIds}
              groupsLoading={groupsLoading}
              groupsError={groupsError}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onIsPublicChange={setIsPublic}
              onDefaultDateRangeChange={setDefaultDateRange}
              onGroupToggle={toggleGroupId}
            />
            <DashboardLayoutSelector
              chartsPerRow={layout.chartsPerRow}
              showDateRangePicker={showDateRangePicker}
              chartCount={chartCount}
              onChartsPerRowChange={handleChartsPerRowChange}
              onShowDateRangePickerChange={setShowDateRangePicker}
            />
          </Box>
        ),
    };

    if (!canManageCharts) {
      return [baseTab];
    }

    return [
      baseTab,
      {
        value: 'charts',
        label: 'Charts',
        content: (
          <DashboardChartsSection
            dashboardId={dashboardId as string}
            charts={charts}
            loadingCharts={loadingCharts}
            onRemoveChart={handleRemoveChart}
            onReorderCharts={handleReorderCharts}
          />
        ),
      },
    ];
  }, [
    isPublic,
    chartCount,
    charts,
    dashboardId,
    defaultDateRange,
    description,
    groupIds,
    groups,
    groupsError,
    groupsLoading,
    handleRemoveChart,
    layout,
    handleChartsPerRowChange,
    loadingCharts,
    setIsPublic,
    setDefaultDateRange,
    setDescription,
    setShowDateRangePicker,
    setTitle,
    showDateRangePicker,
    title,
    toggleGroupId,
  ]);

  useEffect(() => {
    if (!dashboardId) {
      setActiveTab('base');
      return;
    }

    const tab = searchParams.get('tab');
    if (tab === 'charts') {
      setActiveTab('charts');
    } else if (tab === 'base') {
      setActiveTab('base');
    }
  }, [dashboardId, searchParams]);

  return (
    <>
      <PageHeader 
        title={<PageTitle>{dashboardId ? 'Edit Dashboard' : 'Create Dashboard'}</PageTitle>}
        action={
          <Flex gap="2">
            <Button
              onClick={saveDashboard}
              disabled={loading}
            >
              {loading ? 'Saving...' : (dashboardId ? 'Save' : 'Create')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Flex>
        }
      />
      
      <Box className="space-y-6">
        {error && <ErrorMessage message={error} />}

        <Tabs
          value={activeTab}
          onChange={(v) => setActiveTab(v as 'base' | 'charts')}
          items={tabs}
        />
      </Box>
    </>
  );
}
