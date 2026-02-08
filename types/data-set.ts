export type DataSetType = 'combined' | 'preaggregated';

/** Функция агрегации при выборке из БД (один источник или Combined Data Set). */
export type AggregationFunction = 'none' | 'average' | 'minimum' | 'maximum';

export type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days';

export interface PreaggregationConfig {
  dataSourceId: string;
  interval: number; // целочисленное значение
  timeUnit: TimeUnit; // секунды, минуты, часы, дни
}

export interface DataSet {
  _id?: string;
  id: string;
  description: string; // обязательное поле
  type?: DataSetType; // только если несколько источников
  dataSourceIds: string[]; // IDs источников данных
  dataSetIds: string[]; // IDs других дата сетов
  preaggregationConfig?: PreaggregationConfig[]; // настройки предагрегации для каждого источника
  /** Использовать агрегацию при выборке из БД (один источник или Combined Data Set). */
  useAggregation?: boolean;
  /** Функция агрегации (актуально при useAggregation). none = выборка в обрезанные моменты времени. */
  aggregationFunction?: AggregationFunction;
  /** Временное разрешение при агрегации: интервал (актуально при useAggregation). */
  aggregationInterval?: number;
  /** Единица времени для интервала агрегации (актуально при useAggregation). */
  aggregationTimeUnit?: TimeUnit;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // user id
}

