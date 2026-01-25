import { useState, useCallback } from 'react';
import { DataSet } from '@/types/data-set';
import { DataSource } from '@/types/data-source';
import { ColumnMetadata } from '@/types/metadata';
import { SeriesDataContext } from '@/types/series-data';
import type { ChartType, SeriesOptions, YAxis } from '@/types/chart';
import type { Series } from './useChartBuilder';

interface SeriesData {
  dataSet: DataSet | null;
  dataSources: DataSource[];
  columns: ColumnMetadata[];
}

export function useChartData() {
  const [loadingSeries, setLoadingSeries] = useState<Record<string, boolean>>({});
  const [loadingData, setLoadingData] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  const loadDataSetAndColumns = useCallback(async (
    seriesId: string,
    dataSetId: string,
    chartSeries?: {
      xAxisColumn: string;
      yColumnName: string;
      yAxisId: string;
      chartType: ChartType;
      options?: SeriesOptions;
    },
    availableYAxes?: YAxis[]
  ): Promise<Series | null> => {
    try {
      setLoadingSeries((prev) => ({ ...prev, [seriesId]: true }));
      setError('');

      const dataSetResponse = await fetch(`/api/data-sets/${dataSetId}`, {
        credentials: 'include',
      });
      if (!dataSetResponse.ok) {
        throw new Error('Failed to fetch data set');
      }
      const dataSet: DataSet = await dataSetResponse.json();

      const sourcePromises = dataSet.dataSourceIds.map((sourceId) =>
        fetch(`/api/data-sources/${sourceId}`, {
          credentials: 'include',
        }).then((res) => res.json())
      );
      const loadedSources: DataSource[] = await Promise.all(sourcePromises);

      let availableColumns: ColumnMetadata[] = [];

      if (dataSet.type === 'preaggregated') {
        if (loadedSources.length > 0) {
          availableColumns = loadedSources[0].columns || [];
        }
      } else if (dataSet.type === 'combined') {
        availableColumns = loadedSources.flatMap((source) => source.columns || []);
      } else {
        if (loadedSources.length > 0) {
          availableColumns = loadedSources[0].columns || [];
        }
      }

      const seriesData: SeriesData = {
        dataSet,
        dataSources: loadedSources,
        columns: availableColumns,
      };

      return {
        id: seriesId,
        dataSetId,
        seriesData,
        xAxisColumn: chartSeries?.xAxisColumn || '',
        yColumnName: chartSeries?.yColumnName || '',
        yAxisId: chartSeries?.yAxisId || (availableYAxes && availableYAxes.length > 0 ? availableYAxes[0].id : ''),
        chartType: chartSeries?.chartType || 'line',
        options: chartSeries?.options,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data set');
      return null;
    } finally {
      setLoadingSeries((prev) => ({ ...prev, [seriesId]: false }));
    }
  }, []);

  const fetchSeriesChartData = useCallback(async (
    seriesId: string,
    series: Series,
    dateRange: { from: Date; to: Date }
  ): Promise<[number, number][] | null> => {
    if (!series.dataSetId || !series.xAxisColumn || !series.yColumnName || !dateRange) {
      return null;
    }

    try {
      setLoadingData((prev) => ({ ...prev, [seriesId]: true }));
      setError('');

      const context: SeriesDataContext = {
        dataSetId: series.dataSetId,
        xColumnName: series.xAxisColumn,
        yColumnName: series.yColumnName,
        dateRange,
      };

      const response = await fetch('/api/data/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch series data');
      }

      const result = await response.json();
      const data = ((result as { data?: Array<Record<string, unknown>> }).data || []) as Array<Record<string, unknown>>;

      // Преобразуем данные в формат Highcharts [timestamp, value]
      const chartData: [number, number][] = data.map((row) => {
        const xValue = row[series.xAxisColumn];
        const yValue = row[series.yColumnName];

        // Преобразуем xValue в timestamp если это строка даты
        let timestamp: number;
        if (xValue instanceof Date) {
          timestamp = xValue.getTime();
        } else if (typeof xValue === 'string') {
          timestamp = new Date(xValue).getTime();
        } else if (typeof xValue === 'number') {
          timestamp = xValue;
        } else {
          timestamp = Date.parse(String(xValue));
        }

        // Преобразуем yValue в число
        const numValue = typeof yValue === 'number' ? yValue : parseFloat(String(yValue)) || 0;

        return [timestamp, numValue];
      });

      // Сортируем данные по timestamp
      chartData.sort((a, b) => a[0] - b[0]);

      return chartData;
    } catch (err) {
      console.error('Failed to fetch series data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load series data');
      return null;
    } finally {
      setLoadingData((prev) => ({ ...prev, [seriesId]: false }));
    }
  }, []);

  return {
    loadingSeries,
    loadingData,
    error,
    setError,
    loadDataSetAndColumns,
    fetchSeriesChartData,
  };
}

