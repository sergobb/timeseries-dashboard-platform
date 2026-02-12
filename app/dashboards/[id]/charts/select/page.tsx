'use client';

import { use } from 'react';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import PageTitle from '@/components/ui/PageTitle';
import Text from '@/components/ui/Text';
import { useDashboardChartSelection } from '@/hooks/useDashboardChartSelection';
import SelectChartsHeader from '@/components/dashboard/SelectChartsHeader';
import SelectChartsContent from '@/components/dashboard/SelectChartsContent';

export default function SelectChartsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: dashboardId } = use(params);
  const selection = useDashboardChartSelection(dashboardId);

  if (selection.loading) {
    return (
      <PageContainer className="min-h-screen" innerClassName="max-w-7xl mx-auto">
        <PageHeader title={<PageTitle>Select Charts</PageTitle>} />
        <Text>Loading...</Text>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="min-h-screen" innerClassName="max-w-7xl mx-auto">
      <SelectChartsHeader
        selectedCount={selection.selectedChartIds.size}
        saving={selection.saving}
        onCancel={selection.goBack}
        onAddSelected={selection.addChartsToDashboard}
      />
      <SelectChartsContent
        filterText={selection.filterText}
        onFilterChange={selection.setFilterText}
        filteredCharts={selection.filteredCharts}
        error={selection.error}
        isChartInDashboard={selection.isChartInDashboard}
        isChartSelected={selection.isChartSelected}
        onToggleChart={selection.toggleChart}
      />
    </PageContainer>
  );
}
