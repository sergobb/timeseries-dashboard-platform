'use client';

import type { ChartOptions, XAxisOptions, YAxis } from '@/types/chart';
import type { DataSet } from '@/types/data-set';
import type { Series } from '@/hooks/useChartBuilder';
import ChartBuilderLayout from './ChartBuilderLayout';
import ChartOptionsPanel from './ChartOptionsPanel';
import ChartPreview from './ChartPreview';
import type { AccordionContainerRef } from '@/components/ui/AccordionContainer';

interface ChartBuilderPanelsProps {
  dashboardId: string;
  chartOptions: ChartOptions;
  xAxisOptions: XAxisOptions;
  series: Series[];
  yAxes: YAxis[];
  dataSetFilter: string;
  filteredDataSets: DataSet[];
  loadingSeriesById: Record<string, boolean>;
  dateRange: { from: Date; to: Date };
  isDark: boolean;
  theme: string;
  onChartOptionsChange: (v: ChartOptions) => void;
  onXAxisOptionsChange: (v: XAxisOptions) => void;
  onDataSetFilterChange: (v: string) => void;
  onAddSeries: () => void;
  onDataSetChange: (seriesId: string, dataSetId: string) => Promise<void>;
  onUpdateSeries: (seriesId: string, updates: Partial<Series>) => void;
  onRemoveSeries: (seriesId: string) => void;
  onAddYAxis: (seriesId: string) => void;
  onUpdateYAxis: (axisId: string, updates: Partial<YAxis>) => void;
  onRangeChange: (range: { from: Date; to: Date } | null) => void;
  accordionRef: React.RefObject<AccordionContainerRef | null>;
}

export default function ChartBuilderPanels({
  dashboardId,
  chartOptions,
  xAxisOptions,
  series,
  yAxes,
  dataSetFilter,
  filteredDataSets,
  loadingSeriesById,
  dateRange,
  isDark,
  theme,
  onChartOptionsChange,
  onXAxisOptionsChange,
  onDataSetFilterChange,
  onAddSeries,
  onDataSetChange,
  onUpdateSeries,
  onRemoveSeries,
  onAddYAxis,
  onUpdateYAxis,
  onRangeChange,
  accordionRef,
}: ChartBuilderPanelsProps) {
  return (
    <ChartBuilderLayout
      leftPanel={
        <ChartOptionsPanel
          dashboardId={dashboardId}
          chartOptions={chartOptions}
          xAxisOptions={xAxisOptions}
          onChartOptionsChange={onChartOptionsChange}
          onXAxisOptionsChange={onXAxisOptionsChange}
          series={series}
          yAxes={yAxes}
          dataSetFilter={dataSetFilter}
          filteredDataSets={filteredDataSets}
          loadingSeriesById={loadingSeriesById}
          onDataSetFilterChange={onDataSetFilterChange}
          onAddSeries={onAddSeries}
          onDataSetChange={onDataSetChange}
          onUpdateSeries={onUpdateSeries}
          onRemoveSeries={onRemoveSeries}
          onAddYAxis={onAddYAxis}
          onUpdateYAxis={onUpdateYAxis}
          accordionRef={accordionRef}
        />
      }
      rightPanel={
        <ChartPreview
          series={series}
          yAxes={yAxes}
          chartOptions={chartOptions}
          xAxisOptions={xAxisOptions}
          dateRange={dateRange}
          onRangeChange={onRangeChange}
          isDark={isDark}
          theme={theme}
        />
      }
    />
  );
}
