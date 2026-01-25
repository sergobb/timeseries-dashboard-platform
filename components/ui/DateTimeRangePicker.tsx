'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import 'react-day-picker/dist/style.css';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Box from './Box';
import Text from './Text';
import Flex from './Flex';
import { PRESET_RANGES } from '@/lib/date-ranges';

interface DateTimeRangePickerProps {
  value?: { from: Date; to: Date; label?: string };
  onChange?: (range: { from: Date; to: Date } | null) => void;
  className?: string;
}

export default function DateTimeRangePicker({ value, onChange, className = '' }: DateTimeRangePickerProps) {
  const valueFromTime = value?.from?.getTime();
  const valueToTime = value?.to?.getTime();
  const valueLabel = value?.label;

  const currentRange = useMemo(() => {
    if (!value) return undefined;
    if (value.label) {
      return PRESET_RANGES.find(preset => preset.label === value.label)?.getRange();
    }
    return { from: value.from, to: value.to };
  }, [value, valueFromTime, valueToTime, valueLabel]);

  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(undefined);
  const [startTime, setStartTime] = useState({ hours: 0, minutes: 0 });
  const [endTime, setEndTime] = useState({ hours: 23, minutes: 59 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const formatDateTime = (date: Date) => {
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  };

  const formatDisplayRange = () => {
    if (!currentRange?.from) return 'Select date range';
    if (!currentRange.to) return formatDateTime(currentRange.from);
    return `${formatDateTime(currentRange.from)} - ${formatDateTime(currentRange.to)}`;
  };

  const applyTimeToDate = (date: Date, time: { hours: number; minutes: number }) => {
    const newDate = new Date(date);
    newDate.setHours(time.hours, time.minutes, 0, 0);
    return newDate;
  };

  const handleApply = () => {
    if (tempRange?.from && tempRange?.to) {
      const from = applyTimeToDate(tempRange.from, startTime);
      const to = applyTimeToDate(tempRange.to, endTime);
      onChange?.({ from, to });
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTempRange(currentRange);
    if (currentRange?.from) {
      setStartTime({ hours: currentRange.from.getHours(), minutes: currentRange.from.getMinutes() });
    }
    if (currentRange?.to) {
      setEndTime({ hours: currentRange.to.getHours(), minutes: currentRange.to.getMinutes() });
    }
    setIsOpen(false);
  };

  const handlePresetClick = (preset: (typeof PRESET_RANGES)[0]) => {
    const presetRange = preset.getRange();
    setTempRange({ from: presetRange.from, to: presetRange.to });
    setStartTime({ hours: presetRange.from.getHours(), minutes: presetRange.from.getMinutes() });
    setEndTime({ hours: presetRange.to.getHours(), minutes: presetRange.to.getMinutes() });
  };

  const handleRangeSelect = (selectedRange: DateRange | undefined) => {
    setTempRange(selectedRange);
  };

  const updateStartDate = (dateString: string) => {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      setTempRange(prev => prev ? { ...prev, from: date } : { from: date, to: date });
    }
  };

  const updateEndDate = (dateString: string) => {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      setTempRange(prev => {
        if (prev) {
          return { ...prev, to: date };
        }
        return { from: date, to: date };
      });
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className={className}>
      {/* Collapsed view */}
      <Box
        onClick={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          if (nextOpen) {
            setTempRange(currentRange);
            if (currentRange?.from) {
              setStartTime({ hours: currentRange.from.getHours(), minutes: currentRange.from.getMinutes() });
            }
            if (currentRange?.to) {
              setEndTime({ hours: currentRange.to.getHours(), minutes: currentRange.to.getMinutes() });
            }
          }
        }}
        className="cursor-pointer rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm hover:border-[var(--color-ring)] focus:border-[var(--color-ring)] focus:outline-none focus:ring-[var(--color-ring)]"
      >
        <Flex gap="2" align="center">
          <Text size="sm">{formatDisplayRange()}</Text>
        </Flex>
      </Box>

      {/* Expanded view */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsOpen(false)} />
          <div ref={containerRef} className="relative w-full max-w-[900px]">
            <Card className="p-6 shadow-xl">
              <Box className="space-y-4">
            {/* Date/Time inputs */}
            <Flex gap="4">
              <Box className="flex-1">
                <Text size="sm" className="mb-2">Start Date/Time</Text>
                <Flex gap="2" align="center" className="mb-2">
                  <Input
                    type="datetime-local"
                    value={tempRange?.from ? format(tempRange.from, "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => updateStartDate(e.target.value)}
                  />
                </Flex>
                <Flex gap="2" align="center">
                  <Text size="sm">Time:</Text>
                  <Select
                    value={startTime.hours}
                    onChange={(e) => setStartTime({ ...startTime, hours: parseInt(e.target.value) })}
                    className="w-20"
                  >
                    {hours.map(h => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                    ))}
                  </Select>
                  <Text size="sm">:</Text>
                  <Select
                    value={startTime.minutes}
                    onChange={(e) => setStartTime({ ...startTime, minutes: parseInt(e.target.value) })}
                    className="w-20"
                  >
                    {minutes.map(m => (
                      <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                    ))}
                  </Select>
                </Flex>
              </Box>

              <Box className="flex-1">
                <Text size="sm" className="mb-2">End Date/Time</Text>
                <Flex gap="2" align="center" className="mb-2">
                  <Input
                    type="datetime-local"
                    value={tempRange?.to ? format(tempRange.to, "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => updateEndDate(e.target.value)}
                  />
                </Flex>
                <Flex gap="2" align="center">
                  <Text size="sm">Time:</Text>
                  <Select
                    value={endTime.hours}
                    onChange={(e) => setEndTime({ ...endTime, hours: parseInt(e.target.value) })}
                    className="w-20"
                  >
                    {hours.map(h => (
                      <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                    ))}
                  </Select>
                  <Text size="sm">:</Text>
                  <Select
                    value={endTime.minutes}
                    onChange={(e) => setEndTime({ ...endTime, minutes: parseInt(e.target.value) })}
                    className="w-20"
                  >
                    {minutes.map(m => (
                      <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                    ))}
                  </Select>
                </Flex>
              </Box>
            </Flex>

            {/* Calendars and presets */}
            <Flex gap="4">
              {/* Calendars */}
              <Box className="flex-1">
                <DayPicker
                  mode="range"
                  selected={tempRange}
                  onSelect={handleRangeSelect}
                  locale={ru}
                  numberOfMonths={2}
                  className="rdp"
                  classNames={{
                    months: 'flex gap-4',
                    month: 'space-y-4',
                    caption: 'flex justify-center pt-1 relative items-center',
                    caption_label: 'text-sm font-medium text-[var(--color-foreground)]',
                    nav: 'space-x-1 flex items-center',
                    nav_button:
                      'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-[var(--color-foreground)]',
                    nav_button_previous: 'absolute left-1',
                    nav_button_next: 'absolute right-1',
                    table: 'w-full border-collapse space-y-1',
                    head_row: 'flex',
                    head_cell: 'text-[var(--color-muted-foreground)] rounded-md w-9 font-normal text-[0.8rem]',
                    row: 'flex w-full mt-2',
                    cell:
                      'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[var(--color-surface-muted)] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                    day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]',
                    day_range_start: 'day-range-start',
                    day_range_end: 'day-range-end',
                    day_selected:
                      'bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] focus:bg-[var(--color-accent)] focus:text-[var(--color-accent-foreground)] font-semibold',
                    day_today:
                      'bg-[var(--color-surface-muted)] text-[var(--color-foreground)] font-semibold',
                    day_outside:
                      'day-outside text-[var(--color-muted-foreground)] opacity-70 aria-selected:bg-[var(--color-surface-muted)]/50 aria-selected:text-[var(--color-muted-foreground)] aria-selected:opacity-30',
                    day_disabled: 'text-[var(--color-muted-foreground)] opacity-50',
                    day_range_middle:
                      'aria-selected:bg-[var(--color-secondary)] aria-selected:text-[var(--color-secondary-foreground)]',
                    day_hidden: 'invisible',
                  }}
                />
              </Box>

              {/* Preset ranges */}
              <Box className="w-48 border-l border-[var(--color-border)] pl-4">
                <Text size="sm" className="mb-3 font-semibold">Preset Ranges</Text>
                <Box className="space-y-1">
                  {PRESET_RANGES.map((preset) => (
                    <Box
                      key={preset.label}
                      onClick={() => handlePresetClick(preset)}
                      className="cursor-pointer rounded px-2 py-1.5 text-sm hover:bg-[var(--color-surface-muted)]"
                    >
                      <Text size="sm">{preset.label}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Flex>

            {/* Action buttons */}
              <Flex gap="2" justify="end">
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleApply}>
                  Apply
                </Button>
              </Flex>
            </Box>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
}

