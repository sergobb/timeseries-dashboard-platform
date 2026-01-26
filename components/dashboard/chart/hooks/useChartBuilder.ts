import { useState, useCallback } from 'react';
import { ChartType, SeriesOptions, YAxisOptions, ChartOptions, XAxisOptions, YAxis } from '@/types/chart';
import { DataSet } from '@/types/data-set';
import { ColumnMetadata } from '@/types/metadata';
import { DataSource } from '@/types/data-source';

interface SeriesData {
  dataSet: DataSet | null;
  dataSources: DataSource[];
  columns: ColumnMetadata[];
}

export interface Series {
  id: string;
  dataSetId: string;
  seriesData: SeriesData | null;
  xAxisColumn: string;
  yColumnName: string;
  yAxisId: string;
  chartType: ChartType;
  options?: SeriesOptions;
  chartData?: [number, number | null][];
}

export function useChartBuilder() {
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [dataSetFilter, setDataSetFilter] = useState<string>('');
  const [series, setSeries] = useState<Series[]>([]);
  const [yAxes, setYAxes] = useState<YAxis[]>([]);
  const [chartOptions, setChartOptions] = useState<ChartOptions>({});
  const [xAxisOptions, setXAxisOptions] = useState<XAxisOptions>({});
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (365*6 + 7));
    to.setDate(to.getDate() - (365*6));
    return { from, to };
  });

  const filteredDataSets = dataSets.filter((ds) => {
    if (!dataSetFilter.trim()) return true;
    const searchText = dataSetFilter.toLowerCase();
    const description = (ds.description || '').toLowerCase();
    return description.includes(searchText);
  });

  const handleAddSeries = useCallback(() => {
    let firstYAxisId = yAxes.length > 0 ? yAxes[0].id : '';
    if (!firstYAxisId) {
      const newAxis: YAxis = {
        id: `yaxis-${Date.now()}`,
        label: 'Y Axis 1',
        options: {
          title: 'Y Axis 1',
        },
      };
      setYAxes([newAxis]);
      firstYAxisId = newAxis.id;
    }

    const newSeries: Series = {
      id: `series-${Date.now()}`,
      dataSetId: '',
      seriesData: null,
      xAxisColumn: '',
      yColumnName: '',
      yAxisId: firstYAxisId,
      chartType: 'line',
      options: {},
    };
    setSeries((prev) => [...prev, newSeries]);
  }, [yAxes]);

  const handleRemoveSeries = useCallback((seriesId: string) => {
    setSeries((prev) => prev.filter((s) => s.id !== seriesId));
  }, []);

  const handleUpdateSeries = useCallback((seriesId: string, updates: Partial<Series>) => {
    setSeries((prev) =>
      prev.map((s) =>
        s.id === seriesId
          ? {
              ...s,
              ...updates,
              chartData:
                updates.xAxisColumn !== undefined ||
                updates.yColumnName !== undefined ||
                updates.dataSetId !== undefined
                  ? undefined
                  : s.chartData,
            }
          : s
      )
    );
  }, []);

  const handleAddYAxis = useCallback((seriesId: string) => {
    const axisLabel = `Y Axis ${yAxes.length + 1}`;
    const newAxis: YAxis = {
      id: `yaxis-${Date.now()}`,
      label: axisLabel,
      options: {
        title: axisLabel,
      },
    };
    setYAxes((prev) => [...prev, newAxis]);
    handleUpdateSeries(seriesId, { yAxisId: newAxis.id });
  }, [yAxes, handleUpdateSeries]);

  const handleUpdateYAxis = useCallback((axisId: string, updates: Partial<YAxis>) => {
    setYAxes((prev) =>
      prev.map((a) => {
        if (a.id === axisId) {
          const updatedAxis = { ...a, ...updates };
          if ('label' in updates && updates.label !== undefined) {
            const currentTitle = updatedAxis.options?.title;
            const oldLabel = a.label;
            if (!currentTitle || currentTitle === oldLabel) {
              updatedAxis.options = {
                ...updatedAxis.options,
                title: updates.label,
              };
            }
          }
          return updatedAxis;
        }
        return a;
      })
    );
  }, []);

  const handleRangeChange = useCallback((range: { from: Date; to: Date } | null): void => {
    if (!range) return;
    setDateRange(range);
    
    // Очищаем данные для всех серий при изменении диапазона дат
    setSeries((prevSeries) =>
      prevSeries.map((s) =>
        s.dataSetId && s.xAxisColumn && s.yColumnName ? { ...s, chartData: undefined } : s
      )
    );
  }, []);

  return {
    dataSets,
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
  };
}

