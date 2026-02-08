import { getDatabase } from '@/lib/db/mongodb';
import { DataSet } from '@/types/data-set';
import { ObjectId } from 'mongodb';

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
    
    return dataSets.map(ds => ({
      id: ds._id.toString(),
      description: ds.description,
      type: ds.type,
      dataSourceIds: ds.dataSourceIds || [],
      dataSetIds: ds.dataSetIds || [],
      preaggregationConfig: ds.preaggregationConfig || [],
      useAggregation: ds.useAggregation ?? false,
      aggregationFunction: ds.aggregationFunction ?? 'none',
      aggregationInterval: ds.aggregationInterval ?? 1,
      aggregationTimeUnit: ds.aggregationTimeUnit ?? 'seconds',
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
        dataSourceIds: ds.dataSourceIds || [],
        dataSetIds: ds.dataSetIds || [],
        preaggregationConfig: ds.preaggregationConfig || [],
        useAggregation: ds.useAggregation ?? false,
        aggregationFunction: ds.aggregationFunction ?? 'none',
        aggregationInterval: ds.aggregationInterval ?? 1,
        aggregationTimeUnit: ds.aggregationTimeUnit ?? 'seconds',
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
        dataSourceIds: ds.dataSourceIds || [],
        dataSetIds: ds.dataSetIds || [],
        preaggregationConfig: ds.preaggregationConfig || [],
        useAggregation: ds.useAggregation ?? false,
        aggregationFunction: ds.aggregationFunction ?? 'none',
        aggregationInterval: ds.aggregationInterval ?? 1,
        aggregationTimeUnit: ds.aggregationTimeUnit ?? 'seconds',
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
      dataSourceIds: result.dataSourceIds || [],
      dataSetIds: result.dataSetIds || [],
      preaggregationConfig: result.preaggregationConfig || [],
      useAggregation: result.useAggregation ?? false,
      aggregationFunction: result.aggregationFunction ?? 'none',
      aggregationInterval: result.aggregationInterval ?? 1,
      aggregationTimeUnit: result.aggregationTimeUnit ?? 'seconds',
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      createdBy: result.createdBy,
    } as DataSet;
  }

  static async delete(id: string, userId: string, options?: { ignoreOwnership?: boolean }): Promise<boolean> {
    const db = await getDatabase();
    const query: Record<string, unknown> = { _id: new ObjectId(id) };
    if (!options?.ignoreOwnership) {
      query.createdBy = userId;
    }
    const result = await db.collection('data_sets').deleteOne(query);
    
    return result.deletedCount > 0;
  }
}

