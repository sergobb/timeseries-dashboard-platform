import { getDatabase } from '@/lib/db/mongodb';
import { DataSet, TimeUnit } from '@/types/data-set';
import { ChartService } from '@/lib/services/chart.service';
import { ObjectId } from 'mongodb';

/** Нормализует ID из MongoDB (ObjectId/string) в строки для совместимости с импортом метаданных. */
function toIdStrings(arr: unknown[] | undefined | null): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((x) => (x != null && typeof x === 'object' && 'toString' in x ? (x as { toString(): string }).toString() : String(x)));
}

function normalizePreaggregationConfig(config: unknown[] | undefined | null): DataSet['preaggregationConfig'] {
  if (!Array.isArray(config)) return [];
  return config.map((p: unknown) => {
    const item = p as Record<string, unknown>;
    return {
      dataSourceId: toIdStrings([item?.dataSourceId]).find(Boolean) ?? '',
      interval: (item?.interval as number) ?? 1,
      timeUnit: ((item?.timeUnit as string) ?? 'seconds') as TimeUnit,
    };
  });
}

export class DataSetService {
  static async create(
    dataSet: Omit<DataSet, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DataSet> {
    const db = await getDatabase();
    
    const doc = {
      description: dataSet.description,
      type: dataSet.type || null,
      dataSourceIds: dataSet.dataSourceIds || [],
      dataSetIds: dataSet.dataSetIds || [],
      preaggregationConfig: dataSet.preaggregationConfig || [],
      useAggregation: dataSet.useAggregation ?? false,
      aggregationFunction: dataSet.aggregationFunction ?? 'none',
      aggregationInterval: dataSet.aggregationInterval ?? 1,
      aggregationTimeUnit: dataSet.aggregationTimeUnit ?? 'seconds',
      tagIds: dataSet.tagIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: dataSet.createdBy,
    };

    const result = await db.collection('data_sets').insertOne(doc);
    
    return {
      id: result.insertedId.toString(),
      ...doc,
      type: dataSet.type,
    } as DataSet;
  }

  static async getAll(userId?: string): Promise<DataSet[]> {
    const db = await getDatabase();
    const query = userId ? { createdBy: userId } : {};
    const dataSets = await db.collection('data_sets').find(query).toArray();
    
    return dataSets.map((ds) => ({
      id: ds._id.toString(),
      description: ds.description,
      type: ds.type,
      dataSourceIds: toIdStrings(ds.dataSourceIds),
      dataSetIds: toIdStrings(ds.dataSetIds),
      preaggregationConfig: normalizePreaggregationConfig(ds.preaggregationConfig),
      useAggregation: ds.useAggregation ?? false,
      aggregationFunction: ds.aggregationFunction ?? 'none',
      aggregationInterval: ds.aggregationInterval ?? 1,
      aggregationTimeUnit: ds.aggregationTimeUnit ?? 'seconds',
      tagIds: toIdStrings(ds.tagIds),
      createdAt: ds.createdAt,
      updatedAt: ds.updatedAt,
      createdBy: ds.createdBy,
    }));
  }

  static async getById(id: string, userId?: string): Promise<DataSet | null> {
    try {
      const db = await getDatabase();
      
      // Validate ObjectId format
      if (!ObjectId.isValid(id)) {
        return null;
      }
      
      const query: Record<string, unknown> = { _id: new ObjectId(id) };
      if (userId) {
        query.createdBy = userId;
      }
      
      const ds = await db.collection('data_sets').findOne(query);
      
      if (!ds) return null;

      return {
        id: ds._id.toString(),
        description: ds.description,
        type: ds.type,
        dataSourceIds: toIdStrings(ds.dataSourceIds),
        dataSetIds: toIdStrings(ds.dataSetIds),
        preaggregationConfig: normalizePreaggregationConfig(ds.preaggregationConfig),
        useAggregation: ds.useAggregation ?? false,
        aggregationFunction: ds.aggregationFunction ?? 'none',
        aggregationInterval: ds.aggregationInterval ?? 1,
        aggregationTimeUnit: ds.aggregationTimeUnit ?? 'seconds',
        tagIds: toIdStrings(ds.tagIds),
        createdAt: ds.createdAt,
        updatedAt: ds.updatedAt,
        createdBy: ds.createdBy,
      };
    } catch (error) {
      console.error('Error in DataSetService.getById:', error);
      return null;
    }
  }

  static async getByIds(ids: string[]): Promise<DataSet[]> {
    try {
      if (ids.length === 0) return [];
      const db = await getDatabase();
      const objectIds = ids.filter(ObjectId.isValid).map((id) => new ObjectId(id));
      if (objectIds.length === 0) return [];

      const dataSets = await db.collection('data_sets').find({ _id: { $in: objectIds } }).toArray();

      return dataSets.map((ds) => ({
        id: ds._id.toString(),
        description: ds.description,
        type: ds.type,
        dataSourceIds: toIdStrings(ds.dataSourceIds),
        dataSetIds: toIdStrings(ds.dataSetIds),
        preaggregationConfig: normalizePreaggregationConfig(ds.preaggregationConfig),
        useAggregation: ds.useAggregation ?? false,
        aggregationFunction: ds.aggregationFunction ?? 'none',
        aggregationInterval: ds.aggregationInterval ?? 1,
        aggregationTimeUnit: ds.aggregationTimeUnit ?? 'seconds',
        tagIds: toIdStrings(ds.tagIds),
        createdAt: ds.createdAt,
        updatedAt: ds.updatedAt,
        createdBy: ds.createdBy,
      }));
    } catch (error) {
      console.error('Error in DataSetService.getByIds:', error);
      return [];
    }
  }

  static async update(
    id: string,
    updates: Partial<Omit<DataSet, 'id' | 'createdAt' | 'createdBy'>>,
    userId: string,
    options?: { ignoreOwnership?: boolean }
  ): Promise<DataSet | null> {
    const db = await getDatabase();
    
    const updateDoc: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date(),
    };

    const query: Record<string, unknown> = { _id: new ObjectId(id) };
    if (!options?.ignoreOwnership) {
      query.createdBy = userId;
    }

    const result = await db.collection('data_sets').findOneAndUpdate(
      query,
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id.toString(),
      description: result.description,
      type: result.type,
      dataSourceIds: toIdStrings(result.dataSourceIds),
      dataSetIds: toIdStrings(result.dataSetIds),
      preaggregationConfig: normalizePreaggregationConfig(result.preaggregationConfig),
      useAggregation: result.useAggregation ?? false,
      aggregationFunction: result.aggregationFunction ?? 'none',
      aggregationInterval: result.aggregationInterval ?? 1,
      aggregationTimeUnit: result.aggregationTimeUnit ?? 'seconds',
      tagIds: toIdStrings(result.tagIds),
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      createdBy: result.createdBy,
    } as DataSet;
  }

  static async delete(id: string, userId: string, options?: { ignoreOwnership?: boolean }): Promise<boolean> {
    const dashboardIds = await ChartService.getDashboardIdsByDataSetId(id);
    if (dashboardIds.length > 0) {
      throw new Error(
        `Cannot delete data set: it is used in dashboard chart(s). Remove the chart(s) first.`
      );
    }
    const db = await getDatabase();
    const query: Record<string, unknown> = { _id: new ObjectId(id) };
    if (!options?.ignoreOwnership) {
      query.createdBy = userId;
    }
    const result = await db.collection('data_sets').deleteOne(query);

    return result.deletedCount > 0;
  }
}

