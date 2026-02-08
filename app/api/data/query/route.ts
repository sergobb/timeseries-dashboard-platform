import { NextRequest, NextResponse } from 'next/server';
import { QueryService } from '@/lib/services/query.service';
import { DataSetService } from '@/lib/services/data-set.service';
import { DataSourceService } from '@/lib/services/data-source.service';
import { SeriesDataContext } from '@/types/series-data';
import { z } from 'zod';
import { DataSet } from '@/types/data-set';

const querySchema = z.object({
  dataSetId: z.string().min(1),
  xColumnName: z.string().min(1),
  yColumnName: z.string().min(1),
  dateRange: z.object({
    from: z.union([z.string().datetime(), z.string(), z.number()]).transform((val) => {
      if (typeof val === 'number') return new Date(val);
      const s = String(val).trim();
      // Строки без таймзоны (нет Z или ±HH:MM) трактуем как UTC
      if (typeof val === 'string' && !/Z$|[+-]\d{2}:?\d{2}$/.test(s) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/i.test(s)) {
        return new Date(s + 'Z');
      }
      return new Date(val);
    }),
    to: z.union([z.string().datetime(), z.string(), z.number()]).transform((val) => {
      if (typeof val === 'number') return new Date(val);
      const s = String(val).trim();
      if (typeof val === 'string' && !/Z$|[+-]\d{2}:?\d{2}$/.test(s) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/i.test(s)) {
        return new Date(s + 'Z');
      }
      return new Date(val);
    }),
  }).nullable(),
  useCache: z.boolean().optional(),
  cacheTTL: z.number().int().positive().optional(),
});

const maxRows = 5000;
const timeUnits = new Map([['seconds', 1], ['minutes', 60], ['hours', 3600], ['days', 86400]]);

const aggregationTypeMap = {
  none: 'none',
  average: 'avg',
  minimum: 'min',
  maximum: 'max',
} as const;

const getDataSetAggregation = (dataSet: DataSet, dateRange: { from: Date, to: Date }): SeriesDataContext['aggregation'] => {
  if (dataSet.type === 'preaggregated') {
    return null;
  }
  if (!dataSet.useAggregation) {
    return null;
  }
  const type = aggregationTypeMap[dataSet.aggregationFunction ?? 'average'];
  const rangeSeconds = (dateRange.to.getTime() - dateRange.from.getTime()) / 1000;
  if (rangeSeconds <= maxRows) {
        return null;
  }
  if (rangeSeconds / 60 <= maxRows) {
    if (dataSet.aggregationTimeUnit === 'minutes' || dataSet.aggregationTimeUnit === 'hours' || dataSet.aggregationTimeUnit === 'days') {
      return null;
    }
    return { type, resolution: 'minutes' };
  }
  if (rangeSeconds / 3600 <= maxRows) {
    if (dataSet.aggregationTimeUnit === 'hours' || dataSet.aggregationTimeUnit === 'days') {
      return null;
    }
    return { type, resolution: 'hours' };
  }
  if (rangeSeconds / 86400 <= maxRows) {
    if (dataSet.aggregationTimeUnit === 'days') {
      return null;
    }
    return { type, resolution: 'days' };
  }
  return null;
}

const getDataSourceId = (dataSet: DataSet, dateRange: { from: Date, to: Date }, yColumnName: string) => {
  if (dataSet.type === 'preaggregated') {

    if (!dataSet.preaggregationConfig || dataSet.preaggregationConfig.length === 0) {
      return dataSet.dataSourceIds[0];
    }

    const rangeSeconds = (dateRange.to.getTime() - dateRange.from.getTime()) / 1000;
    if (!rangeSeconds) {
      return dataSet.dataSourceIds[0];
    }

    // Находим подходящий preaggregationConfig
    // Ищем такой, где количество интервалов (rangeSeconds / (timeUnit * interval)) <= maxLines

    // Проверяем, что preaggregationConfig определён и не пустой
    const preaggregationConfig = dataSet.preaggregationConfig?.slice().sort((a, b) => {
      const aSeconds = (a.interval ?? 1) * (timeUnits.get(a.timeUnit) ?? 1);
      const bSeconds = (b.interval ?? 1) * (timeUnits.get(b.timeUnit) ?? 1);
      return aSeconds - bSeconds;
    }) ?? [];
    for (const config of preaggregationConfig) {
      const intervalUnit = timeUnits.get(config.timeUnit);
      if (!intervalUnit) continue; // skip if undefined
      const intervalSeconds = config.interval * intervalUnit;
      if (!intervalSeconds) continue; // skip if 0 or undefined
      const numberOfIntervals = rangeSeconds / intervalSeconds;
      if (numberOfIntervals <= maxRows) {
        return config.dataSourceId;
      } 
    }
  } else {
    return dataSet.dataSourceIds.find(id => id.toLowerCase().includes(yColumnName.toLowerCase())) || dataSet.dataSourceIds[0];
  }

  return dataSet.dataSourceIds[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = querySchema.parse(body);

    // dateRange уже преобразован в Date объекты через zod transform
    const dateRange = data.dateRange;
    const dataSet = await DataSetService.getById(data.dataSetId);

    if (!dataSet) {
      return NextResponse.json(
        { error: 'DataSet not found' },
        { status: 404 }
      );
    }

    if (!dateRange) {
      return NextResponse.json(
        { error: 'dateRange is required' },
        { status: 400 }
      );
    }

    const context: SeriesDataContext = {
      dataSetId: data.dataSetId,
      xColumnName: data.xColumnName,
      yColumnName: data.yColumnName,
      dateRange: dateRange as { from: Date; to: Date },
      aggregation: getDataSetAggregation(dataSet, dateRange)
    };

    // Получаем первый DataSource из dataSet.dataSourceIds
    if (!dataSet.dataSourceIds || dataSet.dataSourceIds.length === 0) {
      return NextResponse.json(
        { error: 'DataSet has no data sources' },
        { status: 400 }
      );
    }

    const dataSourceId = getDataSourceId(dataSet, dateRange, context.yColumnName);
    const dataSource = await DataSourceService.getById(dataSourceId);
    if (!dataSource) {
      return NextResponse.json(
        { error: 'DataSource not found' },
        { status: 404 }
      );
    }

    // Выполняем запрос
    const result = await QueryService.executeQuery(
      context,
      dataSource.connectionId,
      dataSource.id,
      data.useCache ?? false,
      data.cacheTTL ?? 3600
    );

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

