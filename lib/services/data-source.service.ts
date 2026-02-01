import { getDatabase } from '@/lib/db/mongodb';
import { DataSource } from '@/types/data-source';
import { ColumnMetadata } from '@/types/metadata';
import { ObjectId } from 'mongodb';

export class DataSourceService {
  static async create(
    dataSource: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DataSource> {
    const db = await getDatabase();
    
    const doc = {
      connectionId: dataSource.connectionId,
      tableName: dataSource.tableName,
      schemaName: dataSource.schemaName || null,
      description: dataSource.description || null,
      columns: dataSource.columns,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: dataSource.createdBy,
    };

    const result = await db.collection('data_sources').insertOne(doc);
    
    return {
      id: result.insertedId.toString(),
      ...doc,
      schemaName: dataSource.schemaName,
    } as DataSource;
  }

  static async getAll(connectionId?: string): Promise<DataSource[]> {
    const db = await getDatabase();
    const query = connectionId ? { connectionId } : {};
    const dataSources = await db.collection('data_sources').find(query).toArray();
    
    return dataSources.map(ds => ({
      id: ds._id.toString(),
      connectionId: ds.connectionId,
      tableName: ds.tableName,
      schemaName: ds.schemaName,
      description: ds.description,
      columns: ds.columns,
      createdAt: ds.createdAt,
      updatedAt: ds.updatedAt,
      createdBy: ds.createdBy,
    }));
  }

  static async getById(id: string): Promise<DataSource | null> {
    const db = await getDatabase();
    const ds = await db.collection('data_sources').findOne({ _id: new ObjectId(id) });
    
    if (!ds) return null;

    return {
      id: ds._id.toString(),
      connectionId: ds.connectionId,
      tableName: ds.tableName,
      schemaName: ds.schemaName,
      description: ds.description,
      columns: ds.columns,
      createdAt: ds.createdAt,
      updatedAt: ds.updatedAt,
      createdBy: ds.createdBy,
    };
  }

  static async getByConnectionAndTable(
    connectionId: string,
    tableName: string,
    schemaName?: string
  ): Promise<DataSource | null> {
    const db = await getDatabase();
    const query: Record<string, unknown> = {
      connectionId,
      tableName,
    };
    if (schemaName !== undefined) {
      query.schemaName = schemaName || null;
    }
    
    const ds = await db.collection('data_sources').findOne(query);
    
    if (!ds) return null;

    return {
      id: ds._id.toString(),
      connectionId: ds.connectionId,
      tableName: ds.tableName,
      schemaName: ds.schemaName,
      description: ds.description,
      columns: ds.columns,
      createdAt: ds.createdAt,
      updatedAt: ds.updatedAt,
      createdBy: ds.createdBy,
    };
  }

  static async update(
    id: string,
    updates: Partial<Omit<DataSource, 'id' | 'createdAt' | 'createdBy'>>,
    userId: string,
    options?: { ignoreOwnership?: boolean }
  ): Promise<DataSource | null> {
    const db = await getDatabase();
    
    const updateDoc: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date(),
    };

    const query: Record<string, unknown> = { _id: new ObjectId(id) };
    if (!options?.ignoreOwnership) {
      query.createdBy = userId;
    }

    const result = await db.collection('data_sources').findOneAndUpdate(
      query,
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id.toString(),
      connectionId: result.connectionId,
      tableName: result.tableName,
      schemaName: result.schemaName,
      description: result.description,
      columns: result.columns,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      createdBy: result.createdBy,
    } as DataSource;
  }

  static async delete(id: string, userId: string, options?: { ignoreOwnership?: boolean }): Promise<boolean> {
    const db = await getDatabase();
    const query: Record<string, unknown> = { _id: new ObjectId(id) };
    if (!options?.ignoreOwnership) {
      query.createdBy = userId;
    }
    const result = await db.collection('data_sources').deleteOne(query);
    
    return result.deletedCount > 0;
  }
}

