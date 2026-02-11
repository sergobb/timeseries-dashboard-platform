import { Series } from './chart';

export type TimeUnit = "seconds" | "minutes" | "hours" | "days";

export interface SeriesDataContext {
  dataSetId: string;
  xColumnName: string;
  yColumnName: string;
  dateRange: { from: Date; to: Date } | null;
  aggregation?: {
    type: 'none' | 'avg' | 'min' | 'max';
    resolution: TimeUnit;
    step: number;
    nextUnit: TimeUnit | undefined;
  } | null;
}

