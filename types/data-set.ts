export type DataSetType = 'combined' | 'preaggregated';
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
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // user id
}

