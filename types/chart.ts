export type ChartType = 'line' | 'bar' | 'scatter' | 'area';

export interface SeriesOptions {
  label?: string;
  // Line options
  mode?: 'lines' | 'markers' | 'lines+markers' | 'text';
  lineShape?: 'linear' | 'spline' | 'hv' | 'vh' | 'hvh' | 'vhv';
  dashStyle?: 'Solid' | 'ShortDash' | 'ShortDot' | 'ShortDashDot' | 'ShortDashDotDot' | 'Dot' | 'Dash' | 'LongDash' | 'DashDot' | 'LongDashDot' | 'LongDashDotDot';
  lineWidth?: number;
  color?: string;
  // Bar options
  orientation?: 'v' | 'h';
  markerColor?: string;
  textPosition?: 'none' | 'inside' | 'outside' | 'auto';
  width?: number;
  // Scatter options
  markerSize?: number;
  markerSymbol?: string;
  // Area options
  fillOpacity?: number;
  threshold?: number;
}

export interface YAxisOptions {
  type?: 'linear' | 'logarithmic';
  title?: string;
  titleStyle?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
  };
  labelsEnabled?: boolean;
  /** Positive integer: Y axis title shift (px). Drives Highcharts title.x and title.margin. */
  titleShift?: number;
  labelsFormat?: string;
  labelsStyle?: {
    fontSize?: string;
    color?: string;
  };
  min?: number;
  max?: number;
  opposite?: boolean;
  gridLineWidth?: number;
  lineWidth?: number;
  tickWidth?: number;
  tickInterval?: number;
  tickLength?: number;
  tickPosition?: 'inside' | 'outside';
  tickColor?: string;
  startOnTick?: boolean;
  endOnTick?: boolean;
}

export interface ChartOptions {
  description?: string;
  title?: string;
  titleStyle?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
  };
  subtitle?: string;
  subtitleStyle?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
  };
  legendEnabled?: boolean;
  legendLayout?: 'horizontal' | 'vertical';
  legendAlign?: 'left' | 'center' | 'right';
  legendVerticalAlign?: 'top' | 'middle' | 'bottom';
  creditsEnabled?: boolean;
  backgroundColor?: string;
  height?: number;
  spaceLeft?: number;
  spaceRight?: number;
  plotBackgroundColor?: string;
  plotBorderWidth?: number;
  plotBorderColor?: string;
  tooltip?: {
    split?: boolean;
    shared?: boolean;
  };
}

export interface XAxisOptions {
  title?: string;
  titleStyle?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
  };
  labelsEnabled?: boolean;
  labelsFormat?: string;
  labelsStyle?: {
    fontSize?: string;
    color?: string;
  };
  gridLineWidth?: number;
  lineWidth?: number;
  tickWidth?: number;
  tickLength?: number;
  tickPosition?: 'inside' | 'outside';
  tickColor?: string;
  dateTimeLabelFormats?: {
    millisecond?: string;
    second?: string;
    minute?: string;
    hour?: string;
    day?: string;
    week?: string;
    month?: string;
    year?: string;
  };
}

export interface Series {
  id: string;
  dataSetId: string;
  xAxisColumn: string;
  yColumnName: string;
  yAxisId: string;
  chartType: ChartType;
  options?: SeriesOptions;
}

export interface YAxis {
  id: string;
  label: string;
  options?: YAxisOptions;
}

export interface Chart {
  _id?: string;
  id: string;
  dashboardId: string;
  series: Series[];
  yAxes: YAxis[];
  chartOptions: ChartOptions;
  xAxisOptions: XAxisOptions;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // user id
}

