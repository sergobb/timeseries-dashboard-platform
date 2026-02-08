import { Series } from './chart';

export interface SeriesDataContext {
  dataSetId: string;
  xColumnName: string;
  yColumnName: string;
  dateRange: { from: Date; to: Date } | null;
  aggregation?: {
    resolution: 'seconds' | 'minutes' | 'hours' | 'days';
    type: 'none' | 'avg' | 'min' | 'max';
  } | null;
}

