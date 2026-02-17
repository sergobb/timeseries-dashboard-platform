'use client';

import { useMemo } from 'react';
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
import { useDashboardBuilder } from '@/hooks/useDashboardBuilder';

interface DashboardBuilderProps {
  dashboardId?: string;
}

export default function DashboardBuilder({ dashboardId }: DashboardBuilderProps) {
  const builder = useDashboardBuilder(dashboardId);

  const tabs = useMemo<TabsItem[]>(() => {
    const canManageCharts = Boolean(dashboardId);
    const baseTab: TabsItem = {
      value: 'base',
      label: 'General',
      content: (
        <Box className="space-y-6">
          <DashboardForm
            title={builder.title}
            description={builder.description}
            isPublic={builder.isPublic}
            defaultDateRange={builder.defaultDateRange}
            customDateRange={builder.customDateRange}
            groups={builder.groups}
            selectedGroupIds={builder.groupIds}
            groupsLoading={builder.groupsLoading}
            groupsError={builder.groupsError}
            tags={builder.tags}
            tagsLoading={builder.tagsLoading}
            selectedTagIds={builder.tagIds}
            onTitleChange={builder.setTitle}
            onDescriptionChange={builder.setDescription}
            onIsPublicChange={builder.setIsPublic}
            onDefaultDateRangeChange={builder.setDefaultDateRange}
            onCustomDateRangeChange={builder.setCustomDateRange}
            onGroupToggle={builder.toggleGroupId}
            onAddTag={builder.addTag}
            onRemoveTag={builder.removeTag}
            onCreateTag={builder.createTag}
          />
          <DashboardLayoutSelector
            chartsPerRow={builder.layout.chartsPerRow}
            showDateRangePicker={builder.showDateRangePicker}
            chartCount={builder.charts.length}
            onChartsPerRowChange={builder.handleChartsPerRowChange}
            onShowDateRangePickerChange={builder.setShowDateRangePicker}
          />
        </Box>
      ),
    };
    if (!canManageCharts) return [baseTab];
    return [
      baseTab,
      {
        value: 'charts',
        label: 'Charts',
        content: (
          <DashboardChartsSection
            dashboardId={dashboardId as string}
            charts={builder.charts}
            loadingCharts={builder.loadingCharts}
            onRemoveChart={builder.handleRemoveChart}
            onReorderCharts={builder.handleReorderCharts}
          />
        ),
      },
    ];
  }, [
    dashboardId,
    builder.title,
    builder.description,
    builder.isPublic,
    builder.defaultDateRange,
    builder.customDateRange,
    builder.groups,
    builder.groupIds,
    builder.groupsLoading,
    builder.groupsError,
    builder.tags,
    builder.tagsLoading,
    builder.tagIds,
    builder.setTitle,
    builder.setDescription,
    builder.setIsPublic,
    builder.setDefaultDateRange,
    builder.setCustomDateRange,
    builder.toggleGroupId,
    builder.addTag,
    builder.removeTag,
    builder.createTag,
    builder.layout.chartsPerRow,
    builder.showDateRangePicker,
    builder.charts,
    builder.loadingCharts,
    builder.handleChartsPerRowChange,
    builder.setShowDateRangePicker,
    builder.handleRemoveChart,
    builder.handleReorderCharts,
  ]);

  return (
    <>
      <PageHeader
        title={
          <PageTitle>{dashboardId ? 'Edit Dashboard' : 'Create Dashboard'}</PageTitle>
        }
        action={
          <Flex gap="2">
            <Button onClick={builder.saveDashboard} disabled={builder.loading}>
              {builder.loading ? 'Saving...' : dashboardId ? 'Save' : 'Create'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={builder.handleCancel}
            >
              Cancel
            </Button>
          </Flex>
        }
      />
      <Box className="space-y-6">
        {builder.error && <ErrorMessage message={builder.error} />}
        <Tabs
          value={builder.activeTab}
          onChange={(v) => builder.setActiveTab(v as 'base' | 'charts')}
          items={tabs}
        />
      </Box>
    </>
  );
}
