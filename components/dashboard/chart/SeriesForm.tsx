'use client';

import { useMemo, useState } from 'react';
import Label from '@/components/ui/Label';
import Select from '@/components/ui/Select';
import SelectWithHTML from '@/components/ui/SelectWithHTML';
import Input from '@/components/ui/Input';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Tabs, { TabsItem } from '@/components/ui/Tabs';
import AccordionElement from '@/components/ui/AccordionElement';
import SeriesOptionsComponent from '@/components/dashboard/chart/SeriesOptions';
import { Series } from './hooks/useChartBuilder';
import { ChartType, YAxis } from '@/types/chart';
import { DataSet } from '@/types/data-set';

interface SeriesFormProps {
  series: Series;
  index: number;
  yAxes: YAxis[];
  dataSetFilter: string;
  filteredDataSets: DataSet[];
  loadingSeries: boolean;
  onDataSetFilterChange: (value: string) => void;
  onDataSetChange: (seriesId: string, dataSetId: string) => void;
  onUpdateSeries: (seriesId: string, updates: Partial<Series>) => void;
  onRemoveSeries: (seriesId: string) => void;
  onAddYAxis: (seriesId: string) => void;
}

export default function SeriesForm({
  series,
  index,
  yAxes,
  dataSetFilter,
  filteredDataSets,
  loadingSeries,
  onDataSetFilterChange,
  onDataSetChange,
  onUpdateSeries,
  onRemoveSeries,
  onAddYAxis,
}: SeriesFormProps) {
  type SeriesTab = 'data' | 'options';
  const [tab, setTab] = useState<SeriesTab>('data');

  const timestampColumns = (series.seriesData?.columns || []).filter(
    (col) =>
      col.dataType?.toLowerCase().includes('timestamp') ||
      col.dataType?.toLowerCase().includes('date') ||
      col.dataType?.toLowerCase().includes('time')
  );

  const tabItems = useMemo<readonly TabsItem[]>(() => {
    return [
      {
        value: 'data',
        label: 'Data',
        content: (
          <div className="space-y-3">
            {/* Выбор дата сета с фильтром */}
            <div>
              <Label htmlFor={`series-dataset-filter-${series.id}`} className="mb-1 text-xs">
                Filter Data Sets
              </Label>
              <Input
                id={`series-dataset-filter-${series.id}`}
                type="text"
                placeholder="Filter by description..."
                value={dataSetFilter}
                onChange={(e) => onDataSetFilterChange(e.target.value)}
                className="mb-2"
              />
              <Label htmlFor={`series-dataset-${series.id}`} className="mb-1 text-xs">
                Data Set
              </Label>
              <Select
                id={`series-dataset-${series.id}`}
                value={series.dataSetId}
                onChange={(e) => onDataSetChange(series.id, e.target.value)}
                disabled={loadingSeries}
              >
                <option value="">Select a data set...</option>
                {filteredDataSets.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.description || ds.id}
                  </option>
                ))}
              </Select>
              {loadingSeries && (
                <Text size="sm" variant="muted" className="mt-1">
                  Loading...
                </Text>
              )}
            </div>

            {/* Ось X */}
            {series.seriesData && series.seriesData.columns.length > 0 && (
              <div>
                <Label htmlFor={`series-xaxis-${series.id}`} className="mb-1 text-xs">
                  X Axis (Timestamp Column)
                </Label>
                {timestampColumns.length === 0 ? (
                  <>
                    <Select id={`series-xaxis-${series.id}`} value="" disabled>
                      <option value="">No timestamp columns available</option>
                    </Select>
                    <Text size="xs" variant="muted" className="mt-1">
                      No timestamp columns found in the data set
                    </Text>
                  </>
                ) : (
                  <SelectWithHTML
                    id={`series-xaxis-${series.id}`}
                    value={series.xAxisColumn}
                    onChange={(value) => onUpdateSeries(series.id, { xAxisColumn: value })}
                    placeholder="Select timestamp column..."
                    options={[
                      { value: '', label: 'Select timestamp column...' },
                      ...timestampColumns.map((col) => {
                        const description = col.description || col.columnName;
                        return {
                          value: col.columnName,
                          label: `${description} (${col.columnName}, ${col.dataType})`,
                        };
                      }),
                    ]}
                  />
                )}
              </div>
            )}

            {/* Y Column */}
            {series.seriesData && series.seriesData.columns.length > 0 && (
              <div>
                <Label htmlFor={`series-ycolumn-${series.id}`} className="mb-1 text-xs">
                  Y Column
                </Label>
                <SelectWithHTML
                  id={`series-ycolumn-${series.id}`}
                  value={series.yColumnName}
                  onChange={(value) => onUpdateSeries(series.id, { yColumnName: value })}
                  placeholder="Select column..."
                  options={[
                    { value: '', label: 'Select column...' },
                    ...series.seriesData.columns
                      .filter((col) => col.columnName !== series.xAxisColumn)
                      .map((col) => {
                        const description = col.description || col.columnName;
                        return {
                          value: col.columnName,
                          label: `${description} (${col.columnName}, ${col.dataType})`,
                        };
                      }),
                  ]}
                />
              </div>
            )}

            {/* Y Axis */}
            <div>
              <Label htmlFor={`series-yaxis-${series.id}`} className="mb-1 text-xs">
                Y Axis
              </Label>
              <div className="flex gap-2">
                <Select
                  id={`series-yaxis-${series.id}`}
                  value={series.yAxisId}
                  onChange={(e) => onUpdateSeries(series.id, { yAxisId: e.target.value })}
                  className="flex-1"
                >
                  {yAxes.length === 0 ? (
                    <option value="">No Y axes available</option>
                  ) : (
                    yAxes.map((axis) => (
                      <option key={axis.id} value={axis.id}>
                        {axis.label}
                      </option>
                    ))
                  )}
                </Select>
                <Button variant="secondary" size="sm" onClick={() => onAddYAxis(series.id)}>
                  New Axis
                </Button>
              </div>
              {/* Редактирование label */}
              {/* {series.yAxisId && selectedYAxis && (
                <div className="mt-2">
                  <Input
                    value={selectedYAxis.label || ''}
                    onChange={(e) => onUpdateYAxis(series.yAxisId, { label: e.target.value })}
                    placeholder="Axis label"
                  />
                </div>
              )} */}
            </div>
          </div>
        ),
      },
      {
        value: 'options',
        label: 'Options',
        content: (
          <div className="space-y-3">
            {/* Chart Type */}
            <div>
              <Label htmlFor={`series-type-${series.id}`} className="mb-1 text-xs">
                Chart Type
              </Label>
              <Select
                id={`series-type-${series.id}`}
                value={series.chartType}
                onChange={(e) =>
                  onUpdateSeries(series.id, {
                    chartType: e.target.value as ChartType,
                    options: {},
                  })
                }
              >
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="scatter">Scatter</option>
                <option value="area">Area</option>
              </Select>
            </div>

            {/* Series Options */}
            {series.chartType && (
              <div>
                <Text size="sm" className="mb-2 font-semibold">
                  Series Options
                </Text>
                {(() => {
                  const yColumn = series.seriesData?.columns?.find(
                    (col) => col.columnName === series.yColumnName
                  );
                  return (
                <SeriesOptionsComponent
                  seriesId={series.id}
                  chartType={series.chartType}
                  yColumnName={series.yColumnName}
                  yColumnDescription={yColumn?.description || yColumn?.columnName}
                  options={series.options}
                  onOptionsChange={(newOptions) => onUpdateSeries(series.id, { options: newOptions })}
                />
                  );
                })()}
              </div>
            )}
          </div>
        ),
      },
    ] as const;
  }, [
    dataSetFilter,
    filteredDataSets,
    loadingSeries,
    onAddYAxis,
    onDataSetChange,
    onDataSetFilterChange,
    onUpdateSeries,
    series.chartType,
    series.dataSetId,
    series.id,
    series.seriesData,
    series.xAxisColumn,
    series.yAxisId,
    series.yColumnName,
    series.options,
    timestampColumns,
    yAxes,
  ]);

  return (
    <AccordionElement
      key={series.id}
      id={series.id}
      title={`Series ${index + 1}`}
      onRemove={() => onRemoveSeries(series.id)}
    >
      <Tabs value={tab} items={tabItems} onChange={(v) => setTab(v as SeriesTab)} />
    </AccordionElement>
  );
}

