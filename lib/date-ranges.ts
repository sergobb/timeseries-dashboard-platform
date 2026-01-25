import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, subYears } from 'date-fns';

export interface DateRangePreset {
  label: string;
  getRange: () => { from: Date; to: Date };
}

export const PRESET_RANGES: DateRangePreset[] = [
  { label: 'Today', getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: 'Yesterday', getRange: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
  { label: 'Last 24 Hours', getRange: () => ({ from: subDays(new Date(), 1), to: new Date() }) },
  { label: 'Last 7 Days', getRange: () => ({ from: startOfDay(subDays(new Date(), 7)), to: endOfDay(new Date()) }) },
  { label: 'Last 30 Days', getRange: () => ({ from: startOfDay(subDays(new Date(), 30)), to: endOfDay(new Date()) }) },
  { label: 'This Month', getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: 'Last 90 Days', getRange: () => ({ from: startOfDay(subDays(new Date(), 90)), to: endOfDay(new Date()) }) },
  { label: 'Last 180 Days', getRange: () => ({ from: startOfDay(subDays(new Date(), 180)), to: endOfDay(new Date()) }) },
  { label: 'This Year', getRange: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
  { label: 'Last Year', getRange: () => ({ from: startOfYear(subYears(new Date(), 1)), to: endOfYear(subYears(new Date(), 1)) }) },
  { label: 'Year to Date', getRange: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

