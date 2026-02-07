'use client';

import { useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Label from '@/components/ui/Label';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Tabs, { TabsItem } from '@/components/ui/Tabs';
import AccordionContainer, { AccordionContainerRef } from '@/components/ui/AccordionContainer';
import ChartOptionsComponent from '@/components/dashboard/chart/ChartOptions';
import XAxisOptionsComponent from '@/components/dashboard/chart/XAxisOptions';
import YAxisOptionsComponent from '@/components/dashboard/chart/YAxisOptions';
import SeriesForm from '@/components/dashboard/chart/SeriesForm';
import ChartOptionsAccordion from '@/components/ui/ChartOptionsAccordion';
import AccordionElement from '@/components/ui/AccordionElement';
import { ChartOptions, XAxisOptions, YAxis } from '@/types/chart';
import { DataSet } from '@/types/data-set';
import { Series } from './hooks/useChartBuilder';

interface ChartOptionsPanelProps {
  dashboardId: string;

  chartOptions: ChartOptions;
  xAxisOptions: XAxisOptions;
  onChartOptionsChange: (options: ChartOptions) => void;
  onXAxisOptionsChange: (options: XAxisOptions) => void;

  series: Series[];
  yAxes: YAxis[];
  dataSetFilter: string;
  filteredDataSets: DataSet[];
  loadingSeriesById: Record<string, boolean | undefined>;
  onDataSetFilterChange: (value: string) => void;
  onAddSeries: () => void;
  onDataSetChange: (seriesId: string, dataSetId: string) => void;
  onUpdateSeries: (seriesId: string, updates: Partial<Series>) => void;
  onRemoveSeries: (seriesId: string) => void;
  onAddYAxis: (seriesId: string) => void;
  onUpdateYAxis: (axisId: string, updates: Partial<YAxis>) => void;

  accordionRef: React.RefObject<AccordionContainerRef | null>;
}

type TabValue = 'general' | 'xAxis' | 'yAxes' | 'extra' | 'series';

export default function ChartOptionsPanel({
  dashboardId,
  chartOptions,
  xAxisOptions,
  onChartOptionsChange,
  onXAxisOptionsChange,
  series,
  yAxes,
  dataSetFilter,
  filteredDataSets,
  loadingSeriesById,
  onDataSetFilterChange,
  onAddSeries,
  onDataSetChange,
  onUpdateSeries,
  onRemoveSeries,
  onAddYAxis,
  onUpdateYAxis,
  accordionRef,
}: ChartOptionsPanelProps) {
  const [tab, setTab] = useState<TabValue>('general');

  const tabItems = useMemo<readonly TabsItem[]>(() => {
    return [
      {
        value: 'general',
        label: 'General',
        content: (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`chart-description-${dashboardId}`} className="mb-1 text-xs">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id={`chart-description-${dashboardId}`}
                value={chartOptions.description || ''}
                onChange={(e) =>
                  onChartOptionsChange({
                    ...chartOptions,
                    description: e.target.value || undefined,
                  })
                }
                placeholder="Chart description"
                rows={3}
                required
              />
            </div>

            <div>
              <Text size="sm" className="mb-2 font-semibold">
                Chart Options
              </Text>
              <ChartOptionsComponent
                chartId={dashboardId}
                options={chartOptions}
                onOptionsChange={onChartOptionsChange}
                visibleFields={[
                  'title',
                  'subtitle',
                  'height',
                  'spaceLeft',
                  'spaceRight',
                  'creditsEnabled',
                  'backgroundColor',
                  'plotBackgroundColor',
                  'plotBorderWidth',
                  'plotBorderColor',
                ]}
              />
            </div>
          </div>
        ),
      },
      {
        value: 'series',
        label: 'Series',
        content: (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Text size="sm" className="font-semibold">
                Series
              </Text>
              <Button onClick={onAddSeries} size="sm">
                Add Series
              </Button>
            </div>

            {series.length === 0 ? (
              <Text variant="muted">
                No series added yet. Click &quot;Add Series&quot; to get started.
              </Text>
            ) : (
              <AccordionContainer ref={accordionRef}>
                {series.map((s, index) => (
                  <SeriesForm
                    key={s.id}
                    series={s}
                    index={index}
                    yAxes={yAxes}
                    dataSetFilter={dataSetFilter}
                    filteredDataSets={filteredDataSets}
                    loadingSeries={Boolean(loadingSeriesById[s.id])}
                    onDataSetFilterChange={onDataSetFilterChange}
                    onDataSetChange={onDataSetChange}
                    onUpdateSeries={onUpdateSeries}
                    onRemoveSeries={onRemoveSeries}
                    onAddYAxis={onAddYAxis}
                  />
                ))}
              </AccordionContainer>
            )}
          </div>
        ),
      },
      {
        value: 'xAxis',
        label: 'X Axis',
        content: (
          <div className="space-y-4">
            <div>
              <Text size="sm" className="mb-2 font-semibold">
                XAxis Options
              </Text>
              <XAxisOptionsComponent
                chartId={dashboardId}
                axisId="xaxis"
                options={xAxisOptions}
                onOptionsChange={onXAxisOptionsChange}
                visibleFields={['title', 'labelsEnabled', 'tickPosition']}
              />
            </div>
          </div>
        ),
      },
      {
        value: 'yAxes',
        label: 'Y Axes',
        content: (
          <div className="space-y-4">
            {yAxes.length === 0 ? (
              <Text variant="muted">
                No Y axes yet. Add a series and use &quot;New Axis&quot; in the Data tab to create one.
              </Text>
            ) : (
              <AccordionContainer>
                {yAxes.map((axis) => (
                  <AccordionElement
                    key={axis.id}
                    id={axis.id}
                    title={`${axis.label}${axis.options?.title ? ` (${axis.options.title})` : ''}`}
                  >
                    <YAxisOptionsComponent
                      seriesId={axis.id}
                      axisId={axis.id}
                      options={axis.options}
                      onOptionsChange={(newOptions) =>
                        onUpdateYAxis(axis.id, { options: newOptions })
                      }
                    />
                  </AccordionElement>
                ))}
              </AccordionContainer>
            )}
          </div>
        ),
      },
      {
        value: 'extra',
        label: 'Extra',
        content: (
          <div className="space-y-4">
            <ChartOptionsAccordion title="Title">
              <ChartOptionsComponent
                chartId={dashboardId}
                options={chartOptions}
                onOptionsChange={onChartOptionsChange}
                visibleFields={['titleStyle.fontSize', 'titleStyle.color']}
              />
            </ChartOptionsAccordion>

            <ChartOptionsAccordion title="Subtitle">
              <ChartOptionsComponent
                chartId={dashboardId}
                options={chartOptions}
                onOptionsChange={onChartOptionsChange}
                visibleFields={['subtitleStyle.fontSize', 'subtitleStyle.color']}
              />
            </ChartOptionsAccordion>

            <ChartOptionsAccordion title="Legend">
              <ChartOptionsComponent
                chartId={dashboardId}
                options={chartOptions}
                onOptionsChange={onChartOptionsChange}
                visibleFields={['legendLayout', 'legendAlign', 'legendVerticalAlign']}
              />
            </ChartOptionsAccordion>

            <ChartOptionsAccordion title="X Axis">
              <XAxisOptionsComponent
                chartId={dashboardId}
                axisId="xaxis"
                options={xAxisOptions}
                onOptionsChange={onXAxisOptionsChange}
                visibleFields={[
                  'titleStyle.fontSize',
                  'titleStyle.color',
                  'labelsStyle.fontSize',
                  'labelsStyle.color',
                  'gridLineWidth',
                  'lineWidth',
                  'tickWidth',
                  'tickLength',
                  'tickPosition',
                ]}
              />
            </ChartOptionsAccordion>

            <ChartOptionsAccordion title="ToolTips">
              <ChartOptionsComponent
                chartId={dashboardId}
                options={chartOptions}
                onOptionsChange={onChartOptionsChange}
                visibleFields={['tooltip.split', 'tooltip.shared']}
              />
            </ChartOptionsAccordion>
          </div>
        ),
      },
    ] as const;
  }, [
    dashboardId,
    chartOptions,
    xAxisOptions,
    onChartOptionsChange,
    onXAxisOptionsChange,
    series,
    yAxes,
    dataSetFilter,
    filteredDataSets,
    loadingSeriesById,
    onDataSetFilterChange,
    onAddSeries,
    onDataSetChange,
    onUpdateSeries,
    onRemoveSeries,
    onAddYAxis,
    onUpdateYAxis,
    accordionRef,
  ]);

  return (
    <Card className="p-6">
      <Text size="lg" className="mb-4 font-semibold">
        Chart Options
      </Text>
      <Tabs value={tab} items={tabItems} onChange={(v) => setTab(v as TabValue)} />
    </Card>
  );
}

