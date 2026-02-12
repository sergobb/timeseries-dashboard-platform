import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Chart, ChartType, SeriesOptions, ChartOptions, XAxisOptions, YAxis } from '@/types/chart';
import type { DataSet } from '@/types/data-set';
import type { Series } from '@/hooks/useChartBuilder';

interface ChartSeriesInput {
  xAxisColumn: string;
  yColumnName: string;
  yAxisId: string;
  chartType: ChartType;
  options?: SeriesOptions;
}

interface UseChartLoaderDeps {
  setDataSets: React.Dispatch<React.SetStateAction<DataSet[]>>;
  setSeries: React.Dispatch<React.SetStateAction<Series[]>>;
  setYAxes: React.Dispatch<React.SetStateAction<YAxis[]>>;
  setChartOptions: React.Dispatch<React.SetStateAction<ChartOptions>>;
  setXAxisOptions: React.Dispatch<React.SetStateAction<XAxisOptions>>;
  loadDataSetAndColumns: (
    seriesId: string,
    dataSetId: string,
    chartSeries?: ChartSeriesInput,
    availableYAxes?: YAxis[]
  ) => Promise<Series | null>;
  fetchSeriesChartData: (
    seriesId: string,
    series: Series,
    dateRange: { from: Date; to: Date }
  ) => Promise<[number, number | null][] | null>;
  dateRange: { from: Date; to: Date };
  series: Series[];
  loadingData: Record<string, boolean>;
  loadingSeries: Record<string, boolean>;
}

export interface UseChartLoaderReturn {
  loading: boolean;
  saving: boolean;
  error: string;
  setError: (v: string) => void;
  setLoading: (v: boolean) => void;
  loadDataSets: () => Promise<void>;
  loadChart: () => Promise<void>;
  saveChart: (params: {
    chartId: string | null;
    dashboardId: string;
    series: Series[];
    yAxes: YAxis[];
    chartOptions: ChartOptions;
    xAxisOptions: XAxisOptions;
  }) => Promise<void>;
  handleSeriesDataSetChange: (seriesId: string, dataSetId: string) => Promise<void>;
}

export function useChartLoader(
  dashboardId: string,
  chartId: string | null,
  deps: UseChartLoaderDeps
): UseChartLoaderReturn {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    setDataSets,
    setSeries,
    setYAxes,
    setChartOptions,
    setXAxisOptions,
    loadDataSetAndColumns,
    fetchSeriesChartData,
    dateRange,
    series,
    loadingData,
    loadingSeries,
  } = deps;

  const loadDataSets = useCallback(async () => {
    try {
      const response = await fetch('/api/data-sets', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch data sets');
      const data = await response.json();
      setDataSets(data as DataSet[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data sets');
    }
  }, [setDataSets]);

  const loadChart = useCallback(async () => {
    if (!chartId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/charts/${chartId}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch chart');
      const chart: Chart = await response.json();

      const loadedSeries: Series[] = [];
      for (const chartSeries of chart.series) {
        const loaded = await loadDataSetAndColumns(
          chartSeries.id,
          chartSeries.dataSetId,
          chartSeries,
          chart.yAxes
        );
        if (loaded) loadedSeries.push(loaded);
      }

      setSeries(loadedSeries);
      setYAxes(chart.yAxes);
      setChartOptions(chart.chartOptions);
      setXAxisOptions(chart.xAxisOptions);

      if (dateRange) {
        loadedSeries.forEach(async (s) => {
          if (s.dataSetId && s.xAxisColumn && s.yColumnName) {
            const chartData = await fetchSeriesChartData(s.id, s, dateRange);
            if (chartData) {
              setSeries((prev) =>
                prev.map((ser) => (ser.id === s.id ? { ...ser, chartData } : ser))
              );
            }
          }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart');
    } finally {
      setLoading(false);
    }
  }, [
    chartId,
    loadDataSetAndColumns,
    fetchSeriesChartData,
    dateRange,
    setSeries,
    setYAxes,
    setChartOptions,
    setXAxisOptions,
  ]);

  useEffect(() => {
    const seriesToFetch = series.filter(
      (s) =>
        s.dataSetId &&
        s.xAxisColumn &&
        s.yColumnName &&
        dateRange &&
        !loadingData[s.id] &&
        !loadingSeries[s.id] &&
        s.seriesData
    );
    seriesToFetch.forEach(async (s) => {
      if (!s.chartData) {
        const data = await fetchSeriesChartData(s.id, s, dateRange);
        if (data) setSeries((prev) => prev.map((ser) => (ser.id === s.id ? { ...ser, chartData: data } : ser)));
      }
    });
  }, [
    series.map((s) => `${s.id}:${s.dataSetId}:${s.xAxisColumn}:${s.yColumnName}:${s.seriesData ? 'loaded' : 'pending'}:${s.chartData ? 'hasData' : 'noData'}`).join('|'),
    dateRange.from.getTime(),
    dateRange.to.getTime(),
    fetchSeriesChartData,
    loadingData,
    loadingSeries,
    setSeries,
  ]);

  const handleSeriesDataSetChange = useCallback(
    async (seriesId: string, dataSetId: string) => {
      if (dataSetId) {
        const loaded = await loadDataSetAndColumns(seriesId, dataSetId);
        if (loaded) {
          setSeries((prev) =>
            prev.map((s) =>
              s.id === seriesId
                ? {
                    ...s,
                    dataSetId: loaded.dataSetId,
                    seriesData: loaded.seriesData,
                    xAxisColumn: loaded.xAxisColumn,
                    yColumnName: loaded.yColumnName,
                  }
                : s
            )
          );
        }
      } else {
        setSeries((prev) =>
          prev.map((s) =>
            s.id === seriesId
              ? { ...s, dataSetId: '', seriesData: null, xAxisColumn: '', yColumnName: '', chartData: undefined }
              : s
          )
        );
      }
    },
    [loadDataSetAndColumns, setSeries]
  );

  const saveChart = useCallback(
    async (params: {
      chartId: string | null;
      dashboardId: string;
      series: Series[];
      yAxes: YAxis[];
      chartOptions: ChartOptions;
      xAxisOptions: XAxisOptions;
    }) => {
      const { chartId: cid, dashboardId: did, series: s, yAxes: y, chartOptions: co, xAxisOptions: xo } = params;
      if (!(co as { description?: string })?.description?.trim()) {
        setError('Description is required');
        setTimeout(() => setError(''), 3000);
        return;
      }
      if (s.length === 0) {
        setError('At least one series is required');
        setTimeout(() => setError(''), 3000);
        return;
      }
      if (s.some((ser) => !ser.dataSetId || !ser.xAxisColumn || !ser.yColumnName)) {
        setError('All series must have a data set, X axis, and Y column selected');
        setTimeout(() => setError(''), 3000);
        return;
      }
      if (y.length === 0) {
        setError('At least one Y axis is required');
        setTimeout(() => setError(''), 3000);
        return;
      }

      setSaving(true);
      setError('');

      try {
        const chartData = {
          ...(cid ? {} : { dashboardId: did }),
          series: s.map((ser) => {
            const yColumn = ser.seriesData?.columns?.find((col) => col.columnName === ser.yColumnName);
            const effectiveLabel =
              (ser.options?.label?.trim() || '') ? ser.options!.label! : (yColumn?.description ?? ser.yColumnName ?? '');
            return {
              id: ser.id,
              dataSetId: ser.dataSetId,
              xAxisColumn: ser.xAxisColumn,
              yColumnName: ser.yColumnName,
              yAxisId: ser.yAxisId,
              chartType: ser.chartType,
              options: { ...ser.options, label: effectiveLabel },
            };
          }),
          yAxes: y,
          chartOptions: co,
          xAxisOptions: xo,
        };

        const url = cid ? `/api/charts/${cid}` : '/api/charts';
        const method = cid ? 'PUT' : 'POST';
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(chartData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to ${cid ? 'update' : 'create'} chart`);
        }
        router.push(`/dashboards/${did}/edit`);
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to ${cid ? 'save' : 'create'} chart`);
        setTimeout(() => setError(''), 5000);
      } finally {
        setSaving(false);
      }
    },
    [router]
  );

  return {
    loading,
    saving,
    error,
    setError,
    setLoading,
    loadDataSets,
    loadChart,
    saveChart,
    handleSeriesDataSetChange,
  };
}
