import type { DragEvent } from 'react';
import { Chart } from '@/types/chart';
import Card from '@/components/ui/Card';
import Flex from '@/components/ui/Flex';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import IconButton from '@/components/ui/IconButton';
import { DeleteIcon, DragHandleIcon, EditIcon } from '@/components/ui/icons';

interface DashboardChartCardProps {
  chart: Chart;
  onEdit: () => void;
  onRemove: () => void;
  onDragStart?: (event: DragEvent<HTMLButtonElement>) => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
  isDragActive?: boolean;
  isDropTarget?: boolean;
}

export default function DashboardChartCard({
  chart,
  onEdit,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragActive,
  isDropTarget,
}: DashboardChartCardProps) {
  const cardClassName = [
    'p-4 h-full flex flex-col transition-shadow',
    isDropTarget ? 'ring-2 ring-[var(--color-accent)]/70' : '',
    isDragActive ? 'opacity-60' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Card className={cardClassName} onDragOver={onDragOver} onDrop={onDrop}>
      <Flex justify="between" align="start" className="mb-2 gap-3">
        <Box className="flex-1">
          <Text size="base" className="font-semibold mb-1">
            {chart.chartOptions.description || chart.chartOptions.title || 'Untitled Chart'}
          </Text>
          <Text size="sm" variant="muted">
            {chart.series.length} series, {chart.yAxes.length} Y axis{chart.yAxes.length !== 1 ? 'es' : ''}
          </Text>
        </Box>
        <IconButton
          variant="secondary"
          icon={<DragHandleIcon />}
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          tooltip="Drag to reorder"
          className="cursor-grab active:cursor-grabbing"
        />
      </Flex>
      <Flex gap="2" align="center" justify="end" className="mt-4">
        <IconButton
          variant="success"
          icon={<EditIcon />}
          onClick={onEdit}
          tooltip="Edit chart"
        />
        <IconButton
          variant="danger"
          icon={<DeleteIcon />}
          onClick={onRemove}
          tooltip="Remove chart from dashboard"
        />
      </Flex>
    </Card>
  );
}
