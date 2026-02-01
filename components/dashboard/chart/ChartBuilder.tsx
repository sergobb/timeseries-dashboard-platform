'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Flex from '@/components/ui/Flex';
import Text from '@/components/ui/Text';
import ErrorMessage from '@/components/ErrorMessage';
import { AccordionContainerRef } from '@/components/ui/AccordionContainer';
import { Chart } from '@/types/chart';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useDashboard } from '@/components/dashboard/hooks/useDashboard';
import { getInitialDateRange } from '@/lib/date-ranges';
import { useChartBuilder, type Series } from './hooks/useChartBuilder';
import { useChartData } from './hooks/useChartData';
import ChartPreview from './ChartPreview';
import ChartBuilderLayout from './ChartBuilderLayout';
import ChartOptionsPanel from './ChartOptionsPanel';

interface ChartBuilderProps {
  dashboardId: string;
  chartId: string | null;
}

export default function ChartBuilder({ dashboardId, chartId }: ChartBuilderProps) {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const { dashboard } = useDashboard(dashboardId);
  const hasSetInitialRange = useRef(false);

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
  } = useChartBuilder();

  const {
    loadingSeries,
    loadingData,
    error: chartDataError,
    loadDataSetAndColumns,
    fetchSeriesChartData,
  } = useChartData();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const accordionRef = useRef<AccordionContainerRef>(null);
  const lastSeriesIdRef = useRef<string | null>(null);


  useEffect(() => {
    fetchDataSets();
    if (chartId) {
      fetchChart();
    } else {
      setLoading(false);
    }
  }, [chartId]);

  useEffect(() => {
    if (chartDataError) {
      setError(chartDataError);
    }
  }, [chartDataError]);

  // Начальный интервал дат из настройки дашборда defaultDateRange
  useEffect(() => {
    if (dashboard?.defaultDateRange && !hasSetInitialRange.current) {
      hasSetInitialRange.current = true;
      handleRangeChange(getInitialDateRange(dashboard.defaultDateRange));
    }
  }, [dashboard?.defaultDateRange, handleRangeChange]);

  // Автоматически открываем новую серию при её добавлении
  useEffect(() => {
    if (series.length > 0) {
      const lastSeries = series[series.length - 1];
      if (lastSeries.id !== lastSeriesIdRef.current) {
        lastSeriesIdRef.current = lastSeries.id;
        setTimeout(() => {
          accordionRef.current?.setActiveId(lastSeries.id);
        }, 0);
      }
    }
  }, [series]);

  // Автоматически загружаем данные для серий при изменении их свойств или диапазона дат
  useEffect(() => {
    const seriesToFetch = series.filter(
      (s) =>
        s.dataSetId &&
        s.xAxisColumn &&
        s.yColumnName &&
        dateRange &&
        !loadingData[s.id] &&
        !loadingSeries[s.id] &&
        s.seriesData // Дождались загрузки метаданных
    );

    seriesToFetch.forEach(async (s) => {
      // Загружаем данные если их ещё нет или если изменился диапазон дат
      if (!s.chartData) {
        const chartData = await fetchSeriesChartData(s.id, s, dateRange);
        if (chartData) {
          setSeries((prev) =>
            prev.map((ser) => (ser.id === s.id ? { ...ser, chartData } : ser))
          );
        }
      }
    });
  }, [
    series.map((s) => `${s.id}:${s.dataSetId}:${s.xAxisColumn}:${s.yColumnName}:${s.seriesData ? 'loaded' : 'pending'}:${s.chartData ? 'hasData' : 'noData'}`).join('|'),
    dateRange.from.getTime(),
    dateRange.to.getTime(),
    fetchSeriesChartData,
    loadingData,
    loadingSeries,
  ]);

  const fetchDataSets = async () => {
    try {
      const response = await fetch('/api/data-sets', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch data sets');
      }
      const data = await response.json();
      setDataSets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data sets');
    }
  };

  const fetchChart = async () => {
    if (!chartId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/charts/${chartId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch chart');
      }
      const chart: Chart = await response.json();

      // Загружаем данные для каждой серии
      const loadedSeries: Series[] = [];
      for (const chartSeries of chart.series) {
        const loaded = await loadDataSetAndColumns(
          chartSeries.id,
          chartSeries.dataSetId,
          chartSeries,
          chart.yAxes
        );
        if (loaded) {
          loadedSeries.push(loaded);
        }
      }

      setSeries(loadedSeries);
      setYAxes(chart.yAxes);
      setChartOptions(chart.chartOptions);
      setXAxisOptions(chart.xAxisOptions);

      // Загружаем данные для всех серий после загрузки графика
      if (dateRange) {
        loadedSeries.forEach(async (s) => {
          if (s.dataSetId && s.xAxisColumn && s.yColumnName) {
            setTimeout(async () => {
              const chartData = await fetchSeriesChartData(s.id, s, dateRange);
              if (chartData) {
                setSeries((prev) =>
                  prev.map((ser) => (ser.id === s.id ? { ...ser, chartData } : ser))
                );
              }
            }, 0);
          }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart');
    } finally {
      setLoading(false);
    }
  };

  const handleSeriesDataSetChange = async (seriesId: string, dataSetId: string) => {
    if (dataSetId) {
      const loadedSeries = await loadDataSetAndColumns(seriesId, dataSetId);
      if (loadedSeries) {
        setSeries((prev) =>
          prev.map((s) =>
            s.id === seriesId
              ? {
                  ...s,
                  dataSetId: loadedSeries.dataSetId,
                  seriesData: loadedSeries.seriesData,
                  xAxisColumn: loadedSeries.xAxisColumn,
                  yColumnName: loadedSeries.yColumnName,
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
  };

  const handleCancel = () => {
    router.push(`/dashboards/${dashboardId}/edit`);
  };

  const handleSave = async () => {
    if (!chartOptions.description || !chartOptions.description.trim()) {
      setError('Description is required');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (series.length === 0) {
      setError('At least one series is required');
      setTimeout(() => setError(''), 3000);
      return;
    }
    const invalidSeries = series.some(
      (s) => !s.dataSetId || !s.xAxisColumn || !s.yColumnName
    );
    if (invalidSeries) {
      setError('All series must have a data set, X axis, and Y column selected');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (yAxes.length === 0) {
      setError('At least one Y axis is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const chartData = {
        ...(chartId ? {} : { dashboardId }),
        series: series.map((s) => {
          const yColumn = s.seriesData?.columns?.find((col) => col.columnName === s.yColumnName);
          const effectiveLabel =
            (s.options?.label?.trim() || '') ? s.options!.label : (yColumn?.description ?? s.yColumnName ?? '');
          return {
            id: s.id,
            dataSetId: s.dataSetId,
            xAxisColumn: s.xAxisColumn,
            yColumnName: s.yColumnName,
            yAxisId: s.yAxisId,
            chartType: s.chartType,
            options: { ...s.options, label: effectiveLabel },
          };
        }),
        yAxes,
        chartOptions,
        xAxisOptions,
      };

      const url = chartId ? `/api/charts/${chartId}` : '/api/charts';
      const method = chartId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(chartData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${chartId ? 'update' : 'create'} chart`);
      }

      router.push(`/dashboards/${dashboardId}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${chartId ? 'save' : 'create'} chart`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Text>Loading chart...</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-shrink-0">
        <PageHeader
          title={<PageTitle>{chartId ? 'Edit Chart' : 'New Chart'}</PageTitle>}
          action={
            <Flex gap="4">
              <Button onClick={handleSave} disabled={series.length === 0 || saving}>
                {saving ? (chartId ? 'Saving...' : 'Creating...') : (chartId ? 'Save Chart' : 'Create Chart')}
              </Button>
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </Flex>
          }
        />
        {error && <ErrorMessage message={error} className="mb-4" />}
      </div>

      <ChartBuilderLayout
        leftPanel={
          <ChartOptionsPanel
            dashboardId={dashboardId}
            chartOptions={chartOptions}
            xAxisOptions={xAxisOptions}
            onChartOptionsChange={setChartOptions}
            onXAxisOptionsChange={setXAxisOptions}
            series={series}
            yAxes={yAxes}
            dataSetFilter={dataSetFilter}
            filteredDataSets={filteredDataSets}
            loadingSeriesById={loadingSeries}
            onDataSetFilterChange={setDataSetFilter}
            onAddSeries={handleAddSeries}
            onDataSetChange={handleSeriesDataSetChange}
            onUpdateSeries={handleUpdateSeries}
            onRemoveSeries={handleRemoveSeries}
            onAddYAxis={handleAddYAxis}
            onUpdateYAxis={handleUpdateYAxis}
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
            onRangeChange={handleRangeChange}
            isDark={resolvedTheme === 'dark'}
            theme={theme}
          />
        }
      />

    </div>
  );
}

