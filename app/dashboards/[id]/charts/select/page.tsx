'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Chart } from '@/types/chart';
import { Dashboard } from '@/types/dashboard';
import ErrorMessage from '@/components/ErrorMessage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Input from '@/components/ui/Input';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import PageTitle from '@/components/ui/PageTitle';
import Flex from '@/components/ui/Flex';

export default function SelectChartsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: dashboardId } = use(params);
  const router = useRouter();
  const [charts, setCharts] = useState<Chart[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [selectedChartIds, setSelectedChartIds] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [dashboardId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Загружаем дашборд
      const dashboardResponse = await fetch(`/api/dashboards/${dashboardId}`, {
        credentials: 'include',
      });
      if (!dashboardResponse.ok) {
        throw new Error('Failed to load dashboard');
      }
      const dashboardData = await dashboardResponse.json();
      setDashboard(dashboardData);

      // Загружаем все чарты
      const chartsResponse = await fetch('/api/charts', {
        credentials: 'include',
      });
      if (!chartsResponse.ok) {
        throw new Error('Failed to load charts');
      }
      const chartsData = await chartsResponse.json();
      setCharts(chartsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChart = (chartId: string) => {
    if (isChartInDashboard(chartId)) {
      return; // Нельзя снять чарт, который уже в дашборде
    }

    setSelectedChartIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chartId)) {
        newSet.delete(chartId);
      } else {
        newSet.add(chartId);
      }
      return newSet;
    });
  };

  const isChartInDashboard = (chartId: string): boolean => {
    return dashboard?.chartIds?.includes(chartId) ?? false;
  };

  const isChartSelected = (chartId: string): boolean => {
    return selectedChartIds.has(chartId);
  };

  const handleAddSelected = async () => {
    if (selectedChartIds.size === 0) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const currentChartIds = dashboard?.chartIds || [];
      const newChartIds = Array.from(new Set([...currentChartIds, ...selectedChartIds]));

      const response = await fetch(`/api/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          chartIds: newChartIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add charts to dashboard');
      }

      router.push(`/dashboards/${dashboardId}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add charts');
    } finally {
      setSaving(false);
    }
  };

  const filteredCharts = charts.filter((chart) => {
    const description = chart.chartOptions.description || chart.chartOptions.title || '';
    return description.toLowerCase().includes(filterText.toLowerCase());
  });

  if (loading) {
    return (
      <PageContainer className="min-h-screen" innerClassName="max-w-7xl mx-auto">
        <PageHeader title={<PageTitle>Select Charts</PageTitle>} />
        <Text>Loading...</Text>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="min-h-screen" innerClassName="max-w-7xl mx-auto">
      <PageHeader
        title={<PageTitle>Select Charts</PageTitle>}
        action={
          <Flex align="center" className="gap-2">
            <Button
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={selectedChartIds.size === 0 || saving}
            >
              {saving ? 'Adding...' : `Add Selected to Dashboard (${selectedChartIds.size})`}
            </Button>
          </Flex>
        }
      />
      
      {error && <ErrorMessage message={error} />}

      <div className="space-y-4">
        {/* Фильтр */}
        <div>
          <Input
            type="text"
            placeholder="Filter by description..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        {/* Список чартов */}
        {filteredCharts.length === 0 ? (
          <Card className="p-4">
            <Text variant="muted">
              {filterText ? 'No charts found matching the filter' : 'No charts available'}
            </Text>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCharts.map((chart) => {
              const isInDashboard = isChartInDashboard(chart.id);
              const isSelected = isChartSelected(chart.id);
              const description = chart.chartOptions.description || chart.chartOptions.title || 'Untitled Chart';

              return (
                <Card key={chart.id} className="p-4">
                  <Flex align="start" className="gap-3">
                    <Checkbox
                      checked={isInDashboard || isSelected}
                      disabled={isInDashboard}
                      onChange={() => handleToggleChart(chart.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <Text size="base" className="font-semibold mb-1">
                        {description}
                      </Text>
                      <Text size="sm" variant="muted" className="mb-2">
                        {chart.series.length} series, {chart.yAxes.length} Y axis
                        {chart.yAxes.length !== 1 ? 'es' : ''}
                      </Text>
                      {isInDashboard && (
                        <Text size="xs" variant="muted" className="italic">
                          Already in dashboard
                        </Text>
                      )}
                    </div>
                  </Flex>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

