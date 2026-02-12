'use client';

import type { Chart } from '@/types/chart';
import ErrorMessage from '@/components/ErrorMessage';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Input from '@/components/ui/Input';
import SelectChartsChartCard from './SelectChartsChartCard';

interface SelectChartsContentProps {
  filterText: string;
  onFilterChange: (value: string) => void;
  filteredCharts: Chart[];
  error: string;
  isChartInDashboard: (chartId: string) => boolean;
  isChartSelected: (chartId: string) => boolean;
  onToggleChart: (chartId: string) => void;
}

export default function SelectChartsContent({
  filterText,
  onFilterChange,
  filteredCharts,
  error,
  isChartInDashboard,
  isChartSelected,
  onToggleChart,
}: SelectChartsContentProps) {
  return (
    <>
      {error && <ErrorMessage message={error} />}
      <div className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Filter by description..."
            value={filterText}
            onChange={(e) => onFilterChange(e.target.value)}
          />
        </div>
        {filteredCharts.length === 0 ? (
          <Card className="p-4">
            <Text variant="muted">
              {filterText ? 'No charts found matching the filter' : 'No charts available'}
            </Text>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCharts.map((chart) => (
              <SelectChartsChartCard
                key={chart.id}
                chart={chart}
                isInDashboard={isChartInDashboard(chart.id)}
                isSelected={isChartSelected(chart.id)}
                onToggle={() => onToggleChart(chart.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
