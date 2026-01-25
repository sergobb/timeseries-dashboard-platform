'use client';

import { use } from 'react';
import PageContainer from '@/components/PageContainer';
import ChartBuilder from '@/components/dashboard/chart/ChartBuilder';

export default function EditChartPage({
  params,
}: {
  params: Promise<{ id: string; chartId: string }>;
}) {
  const { id: dashboardId, chartId } = use(params);

  return (
    <PageContainer
      flex
      className="min-h-screen"
      innerClassName="max-w-7xl mx-auto h-full flex flex-col min-h-0"
    >
      <ChartBuilder dashboardId={dashboardId} chartId={chartId} />
    </PageContainer>
  );
}

