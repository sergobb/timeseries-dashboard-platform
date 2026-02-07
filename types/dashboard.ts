export type ChartType = 'line' | 'bar' | 'scatter';

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  connectionId: string;
  tableId: string;
  xAxis: string; // column name
  yAxis: string; // column name
  groupBy?: string; // column name for grouping
  filters?: {
    timeRange?: {
      from: Date | string;
      to: Date | string;
    };
    valueFilters?: Array<{
      column: string;
      operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
      value: unknown;
    }>;
  };
  aggregation?: {
    type: 'avg' | 'sum' | 'min' | 'max' | 'count';
    column: string;
    groupBy?: string; // time interval: '1m', '1h', '1d', etc.
  };
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/** @deprecated Used for backward compat when reading old docs. New model: isPublic + groupIds. */
export type DashboardAccess = 'public' | 'private' | 'shared';

export type LegacyDashboardLayoutType = 'row' | 'column' | 'grid';

export interface DashboardLayout {
  chartsPerRow: number;
}

export type DashboardLayoutInput = DashboardLayout | { type: LegacyDashboardLayoutType };

export interface DashboardShare {
  _id?: string;
  id: string;
  dashboardId: string;
  userId: string;
  accessLevel: 'view' | 'edit';
  createdAt: Date;
  createdBy: string;
}

export interface Dashboard {
  _id?: string;
  id: string;
  title: string;
  description?: string;
  charts: ChartConfig[];
  chartIds?: string[]; // IDs новых charts
  groupIds?: string[];
  /** Public for view by anyone. Default false (private). Can be combined with groupIds sharing. */
  isPublic?: boolean;
  /** @deprecated Read from old docs. New code uses isPublic. */
  access?: DashboardAccess;
  defaultDateRange?: string;
  canEdit?: boolean;
  /**
   * Показывать ли выбор интервала на просмотре дашборда (DateTimeRangePicker/DateRangePicker).
   * Если поле отсутствует в старых документах — считаем true.
   */
  showDateRangePicker?: boolean;
  layout?: DashboardLayoutInput;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // user id
}

