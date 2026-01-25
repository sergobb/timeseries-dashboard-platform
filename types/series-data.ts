import { Series } from './chart';

export interface SeriesDataContext {
  dataSetId: string;
  xColumnName: string;
  yColumnName: string;
  dateRange: { from: Date; to: Date } | null;
}

