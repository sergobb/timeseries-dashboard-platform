import { Chart } from '@/types/chart';
import type { DragEvent } from 'react';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@/components/ui/Box';
import Flex from '@/components/ui/Flex';
import Label from '@/components/ui/Label';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import LinkButton from '@/components/ui/LinkButton';
import DashboardChartCard from './DashboardChartCard';

interface DashboardChartsSectionProps {
  dashboardId: string;
  charts: Chart[];
  loadingCharts: boolean;
  onRemoveChart: (chartId: string) => Promise<void>;
  onReorderCharts: (nextChartIds: string[]) => Promise<void>;
}

export default function DashboardChartsSection({
  dashboardId,
  charts,
  loadingCharts,
  onRemoveChart,
  onReorderCharts,
}: DashboardChartsSectionProps) {
  const router = useRouter();
  const [draggedChartId, setDraggedChartId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const handleEdit = (chartId: string) => {
    router.push(`/dashboards/${dashboardId}/charts/${chartId}/edit`);
  };

  const handleRemove = async (chartId: string) => {
    await onRemoveChart(chartId);
  };

  const getReorderedChartIds = useCallback((fromId: string, toId: string) => {
    const fromIndex = charts.findIndex((chart) => chart.id === fromId);
    const toIndex = charts.findIndex((chart) => chart.id === toId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return null;

    const nextCharts = [...charts];
    const [moved] = nextCharts.splice(fromIndex, 1);
    nextCharts.splice(toIndex, 0, moved);
    return nextCharts.map((chart) => chart.id);
  }, [charts]);

  const handleDragStart = useCallback(
    (chartId: string) => (event: DragEvent<HTMLButtonElement>) => {
      setDraggedChartId(chartId);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', chartId);
    },
    []
  );

  const handleDragOver = useCallback(
    (chartId: string) => (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      if (dropTargetId !== chartId) {
        setDropTargetId(chartId);
      }
    },
    [dropTargetId]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedChartId(null);
    setDropTargetId(null);
  }, []);

  const handleDrop = useCallback(
    (chartId: string) => async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const sourceId = event.dataTransfer.getData('text/plain') || draggedChartId;
      setDropTargetId(null);

      if (!sourceId || sourceId === chartId) return;

      const nextChartIds = getReorderedChartIds(sourceId, chartId);
      if (!nextChartIds) return;

      await onReorderCharts(nextChartIds);
    },
    [draggedChartId, getReorderedChartIds, onReorderCharts]
  );

  return (
    <Box>
      <Flex justify="between" align="center" className="mb-4">
        <Label className="mb-0">Charts</Label>
        <Flex gap="2">
          <LinkButton
            variant="secondary"
            href={`/dashboards/${dashboardId}/charts/new`}
            title="Create New Chart"
          >
            Create New Chart
          </LinkButton>
          {/* <LinkButton
            variant="secondary"
            href={`/dashboards/${dashboardId}/charts/select`}
            title="Add Existing Chart"
          >
            Add Existing Chart
          </LinkButton> */}
        </Flex>
      </Flex>
      {loadingCharts ? (
        <Text variant="muted">Loading charts...</Text>
      ) : charts.length === 0 ? (
        <Card className="p-4">
          <Text variant="muted">No charts added yet. Create a new chart or add an existing one.</Text>
        </Card>
      ) : (
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {charts.map((chart) => (
            <DashboardChartCard
              key={chart.id}
              chart={chart}
              onEdit={() => handleEdit(chart.id)}
              onRemove={() => handleRemove(chart.id)}
              onDragStart={handleDragStart(chart.id)}
              onDragOver={handleDragOver(chart.id)}
              onDrop={handleDrop(chart.id)}
              onDragEnd={handleDragEnd}
              isDragActive={draggedChartId === chart.id}
              isDropTarget={dropTargetId === chart.id}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
