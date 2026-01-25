import { getDatabase } from '@/lib/db/mongodb';
import { TableMetadata } from '@/types/metadata';
import { ObjectId } from 'mongodb';

export class MetadataService {
  static async create(metadata: Omit<TableMetadata, 'id' | 'createdAt' | 'updatedAt'>): Promise<TableMetadata> {
    const db = await getDatabase();
    
    const doc = {
      tableId: metadata.tableId,
      tableName: metadata.tableName,
      description: metadata.description || null,
      columns: metadata.columns,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: metadata.createdBy,
    };

    const result = await db.collection('metadata').insertOne(doc);
    
    return {
      id: result.insertedId.toString(),
      ...doc,
    } as TableMetadata;
  }

  static async getAll(): Promise<TableMetadata[]> {
    const db = await getDatabase();
    const metadataList = await db.collection('metadata').find({}).toArray();
    
    return metadataList.map(meta => ({
      id: meta._id.toString(),
      tableId: meta.tableId,
      tableName: meta.tableName,
      description: meta.description,
      columns: meta.columns,
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt,
      createdBy: meta.createdBy,
    }));
  }

  static async getById(id: string): Promise<TableMetadata | null> {
    const db = await getDatabase();
    const meta = await db.collection('metadata').findOne({ _id: new ObjectId(id) });
    
    if (!meta) return null;

    return {
      id: meta._id.toString(),
      tableId: meta.tableId,
      tableName: meta.tableName,
      description: meta.description,
      columns: meta.columns,
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt,
      createdBy: meta.createdBy,
    };
  }

  static async getByTableId(tableId: string): Promise<TableMetadata | null> {
    const db = await getDatabase();
    const meta = await db.collection('metadata').findOne({ tableId });
    
    if (!meta) return null;

    return {
      id: meta._id.toString(),
      tableId: meta.tableId,
      tableName: meta.tableName,
      description: meta.description,
      columns: meta.columns,
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt,
      createdBy: meta.createdBy,
    };
  }

  static async update(id: string, updates: Partial<Omit<TableMetadata, 'id' | 'createdAt' | 'createdBy'>>, userId: string): Promise<TableMetadata | null> {
    const db = await getDatabase();
    
    const updateDoc: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await db.collection('metadata').findOneAndUpdate(
      { _id: new ObjectId(id), createdBy: userId },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id.toString(),
      tableId: result.tableId,
      tableName: result.tableName,
      description: result.description,
      columns: result.columns,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      createdBy: result.createdBy,
    } as TableMetadata;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection('metadata').deleteOne({
      _id: new ObjectId(id),
      createdBy: userId,
    });
    
    return result.deletedCount > 0;
  }
}

