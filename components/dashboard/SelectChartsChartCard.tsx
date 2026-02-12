'use client';

import type { Chart } from '@/types/chart';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Checkbox from '@/components/ui/Checkbox';
import Flex from '@/components/ui/Flex';

interface SelectChartsChartCardProps {
  chart: Chart;
  isInDashboard: boolean;
  isSelected: boolean;
  onToggle: () => void;
}

export default function SelectChartsChartCard({
  chart,
  isInDashboard,
  isSelected,
  onToggle,
}: SelectChartsChartCardProps) {
  const description = chart.chartOptions?.description || chart.chartOptions?.title || 'Untitled Chart';
  return (
    <Card className="p-4">
      <Flex align="start" className="gap-3">
        <Checkbox
          checked={isInDashboard || isSelected}
          disabled={isInDashboard}
          onChange={onToggle}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <Text size="base" className="font-semibold mb-1">
            {description}
          </Text>
          <Text size="sm" variant="muted" className="mb-2">
            {chart.series?.length ?? 0} series, {chart.yAxes?.length ?? 0} Y axis
            {(chart.yAxes?.length ?? 0) !== 1 ? 'es' : ''}
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
}
