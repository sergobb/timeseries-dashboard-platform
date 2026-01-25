'use client';

import { useState } from 'react';
import DateTimeRangePicker from '@/components/ui/DateTimeRangePicker';
import Box from '@/components/ui/Box';

interface DateRangePickerProps {
  value?: { from: Date; to: Date; label?: string };
  onRangeChange?: (range: { from: Date; to: Date } | null) => void;
}

export default function DateRangePicker({ value, onRangeChange}: DateRangePickerProps) {
  const [range, setRange] = useState<{ from: Date; to: Date; label?: string } | null>(value ? value : null);

  const handleChange = (newRange: { from: Date; to: Date; label?: string } | null) => {
    setRange(newRange);
    onRangeChange?.(newRange);
  };

  return (
    <Box className="space-y-4">
      <DateTimeRangePicker
        value={range || undefined}
        onChange={handleChange}
      />
    </Box>
  );
}

