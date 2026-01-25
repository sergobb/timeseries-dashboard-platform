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
      return new Date(val);
    }),
    to: z.union([z.string().datetime(), z.string(), z.number()]).transform((val) => {
      if (typeof val === 'number') return new Date(val);
      return new Date(val);
    }),
  }).nullable(),
  useCache: z.boolean().optional(),
  cacheTTL: z.number().int().positive().optional(),
});

const maxRows = 2000;
const timeUnits = new Map([['seconds', 1], ['minutes', 60], ['hours', 3600], ['days', 86400]]);

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
    };

    // const dataSeries = await DataSeriesService.getById(context.seriesId);
    
    // Получаем DataSet по series.dataSetId
    const dataSet = await DataSetService.getById(context.dataSetId);
    if (!dataSet) {
      return NextResponse.json(
        { error: 'DataSet not found' },
        { status: 404 }
      );
    }

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

