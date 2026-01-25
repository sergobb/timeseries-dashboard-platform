import { type ChangeEvent } from 'react';
import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import Checkbox from '@/components/ui/Checkbox';
import Flex from '@/components/ui/Flex';
import { DEFAULT_CHARTS_PER_ROW } from '@/lib/dashboard-layout';

interface DashboardLayoutSelectorProps {
  chartsPerRow: number;
  showDateRangePicker: boolean;
  chartCount: number;
  onChartsPerRowChange: (next: number) => void;
  onShowDateRangePickerChange: (next: boolean) => void;
}

export default function DashboardLayoutSelector({
  chartsPerRow,
  showDateRangePicker,
  chartCount,
  onChartsPerRowChange,
  onShowDateRangePickerChange,
}: DashboardLayoutSelectorProps) {
  const safeChartsPerRow = Number.isFinite(chartsPerRow)
    ? Math.max(1, Math.floor(chartsPerRow))
    : DEFAULT_CHARTS_PER_ROW;

  const handleChartsPerRowChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if (!Number.isFinite(next)) {
      onChartsPerRowChange(DEFAULT_CHARTS_PER_ROW);
      return;
    }
    onChartsPerRowChange(Math.max(1, Math.floor(next)));
  };

  const handleShowDateRangePickerChange = (next: boolean) => {
    onShowDateRangePickerChange(next);
  };

  return (
    <Box className="space-y-3">
      <Box>
        <Label htmlFor="dashboardChartsPerRow" className="mb-2">
          Charts per row
        </Label>
        <Input
          id="dashboardChartsPerRow"
          type="number"
          min={1}
          step={1}
          value={safeChartsPerRow}
          onChange={handleChartsPerRowChange}
        />
      </Box>

      <Box>
        <Flex gap="2" align="center">
          <Checkbox
            id="dashboardShowDateRangePicker"
            checked={showDateRangePicker}
            onChange={(e) => handleShowDateRangePickerChange(e.target.checked)}
          />
          <Label htmlFor="dashboardShowDateRangePicker" className="mb-0">
            Show date range picker
          </Label>
        </Flex>
      </Box>

      <Text variant="muted" size="sm">
        {chartCount <= 1
          ? "With 1 chart, layout doesn't affect the result."
          : `Charts: ${chartCount}. Each row will contain up to ${safeChartsPerRow} charts.`}
      </Text>
    </Box>
  );
}

