'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Text from '@/components/ui/Text';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useDashboard } from '@/hooks/useDashboard';
import { getInitialDateRange } from '@/lib/date-ranges';
import { useChartBuilder, type Series } from '@/hooks/useChartBuilder';
import { useChartData } from '@/hooks/useChartData';
import { useChartLoader } from '@/hooks/useChartLoader';
import { AccordionContainerRef } from '@/components/ui/AccordionContainer';
import ChartBuilderHeader from './ChartBuilderHeader';
import ChartBuilderStepper from './ChartBuilderStepper';
import ChartBuilderPanels from './ChartBuilderPanels';

interface ChartBuilderProps {
  dashboardId: string;
  chartId: string | null;
}

export default function ChartBuilder({ dashboardId, chartId }: ChartBuilderProps) {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const { dashboard } = useDashboard(dashboardId);
  const hasSetInitialRange = useRef(false);
  const accordionRef = useRef<AccordionContainerRef | null>(null);
  const lastSeriesIdRef = useRef<string | null>(null);

  const builder = useChartBuilder();
  const {
    setDataSets,
    dataSetFilter,
    setDataSetFilter,
    filteredDataSets,
    series,
    setSeries,
    yAxes,
    setYAxes,
    chartOptions,
    setChartOptions,
    xAxisOptions,
    setXAxisOptions,
    dateRange,
    handleAddSeries,
    handleRemoveSeries,
    handleUpdateSeries,
    handleAddYAxis,
    handleUpdateYAxis,
    handleRangeChange,
  } = builder;

  const chartData = useChartData();
  const { loadDataSetAndColumns, fetchSeriesChartData, error: chartDataError } = chartData;

  const loader = useChartLoader(dashboardId, chartId, {
    setDataSets,
    setSeries,
    setYAxes,
    setChartOptions,
    setXAxisOptions,
    loadDataSetAndColumns,
    fetchSeriesChartData,
    dateRange,
    series,
    loadingData: chartData.loadingData,
    loadingSeries: chartData.loadingSeries,
  });

  useEffect(() => {
    loader.loadDataSets();
    if (chartId) loader.loadChart();
    else loader.setLoading(false);
  }, [chartId]);

  useEffect(() => {
    if (chartDataError) loader.setError(chartDataError);
  }, [chartDataError, loader.setError]);

  useEffect(() => {
    if (dashboard && !hasSetInitialRange.current) {
      hasSetInitialRange.current = true;
      handleRangeChange(getInitialDateRange(dashboard.defaultDateRange, dashboard.customDateRange ?? undefined));
    }
  }, [dashboard?.defaultDateRange, dashboard?.customDateRange, handleRangeChange]);

  useEffect(() => {
    if (series.length > 0) {
      const lastSeries = series[series.length - 1];
      if (lastSeries.id !== lastSeriesIdRef.current) {
        lastSeriesIdRef.current = lastSeries.id;
        setTimeout(() => accordionRef.current?.setActiveId(lastSeries.id), 0);
      }
    }
  }, [series]);

  const handleCancel = () => router.push(`/dashboards/${dashboardId}/edit`);

  const handleSave = () =>
    loader.saveChart({
      chartId,
      dashboardId,
      series,
      yAxes,
      chartOptions,
      xAxisOptions,
    });

  if (loader.loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Text>Loading chart...</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ChartBuilderHeader
        chartId={chartId}
        saving={loader.saving}
        hasSeries={series.length > 0}
        onSave={handleSave}
        onCancel={handleCancel}
        error={loader.error}
      />
      <ChartBuilderStepper />
      <ChartBuilderPanels
        dashboardId={dashboardId}
        chartOptions={chartOptions}
        xAxisOptions={xAxisOptions}
        series={series}
        yAxes={yAxes}
        dataSetFilter={dataSetFilter}
        filteredDataSets={filteredDataSets}
        loadingSeriesById={chartData.loadingSeries}
        dateRange={dateRange}
        isDark={resolvedTheme === 'dark'}
        theme={theme ?? 'light'}
        onChartOptionsChange={setChartOptions}
        onXAxisOptionsChange={setXAxisOptions}
        onDataSetFilterChange={setDataSetFilter}
        onAddSeries={handleAddSeries}
        onDataSetChange={loader.handleSeriesDataSetChange}
        onUpdateSeries={handleUpdateSeries}
        onRemoveSeries={handleRemoveSeries}
        onAddYAxis={handleAddYAxis}
        onUpdateYAxis={handleUpdateYAxis}
        onRangeChange={handleRangeChange}
        accordionRef={accordionRef}
      />
    </div>
  );
}
