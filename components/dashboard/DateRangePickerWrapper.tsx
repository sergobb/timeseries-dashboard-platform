'use client';

import DateRangePicker from './DateRangePicker';

export default function DateRangePickerWrapper() {
  const handleRangeChange = (range: { from: Date; to: Date } | null) => {
    if (range) {
      console.log('Date range selected:', {
        from: range.from.toISOString(),
        to: range.to.toISOString()
      });
      // Здесь можно добавить дополнительную логику обработки выбранного интервала
    } else {
      console.log('Date range cleared');
    }
  };

  return <DateRangePicker value={{ from: new Date(), to: new Date(), label: 'Last 7 Days' }} onRangeChange={handleRangeChange} />;
}

