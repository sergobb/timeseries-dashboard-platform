import { getDatabase } from '@/lib/db/mongodb';
import { DatabaseConnection, DatabaseType } from '@/types/database';
import { encrypt } from '@/lib/crypto';
import { ObjectId } from 'mongodb';
import { PostgresDriver } from '@/lib/drivers/postgres.driver';
import { ClickHouseDriver } from '@/lib/drivers/clickhouse.driver';

export class DatabaseConnectionService {
  static async create(connection: Omit<DatabaseConnection, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseConnection> {
    const db = await getDatabase();
    const encryptedPassword = encrypt(connection.password);
    
    const doc = {
      name: connection.name,
      type: connection.type,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
      password: encryptedPassword,
      active: connection.active !== undefined ? connection.active : true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: connection.createdBy,
    };

    const result = await db.collection('database_connections').insertOne(doc);
    
    return {
      id: result.insertedId.toString(),
      ...doc,
      password: encryptedPassword,
    } as DatabaseConnection;
  }

  static async getAll(userId?: string): Promise<DatabaseConnection[]> {
    const db = await getDatabase();
    const query = userId ? { createdBy: userId } : {};
    const connections = await db.collection('database_connections').find(query).toArray();
    
    return connections.map(conn => ({
      id: conn._id.toString(),
      name: conn.name,
      type: conn.type as DatabaseType,
      host: conn.host,
      port: conn.port,
      database: conn.database,
      username: conn.username,
      password: conn.password,
      active: conn.active !== undefined ? conn.active : true,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
      createdBy: conn.createdBy,
    }));
  }

  static async getById(id: string): Promise<DatabaseConnection | null> {
    const db = await getDatabase();
    const conn = await db.collection('database_connections').findOne({ _id: new ObjectId(id) });
    
    if (!conn) return null;

    return {
      id: conn._id.toString(),
      name: conn.name,
      type: conn.type as DatabaseType,
      host: conn.host,
      port: conn.port,
      database: conn.database,
      username: conn.username,
      password: conn.password,
      active: conn.active !== undefined ? conn.active : true,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
      createdBy: conn.createdBy,
    };
  }

  static async update(
    id: string,
    updates: Partial<Omit<DatabaseConnection, 'id' | 'createdAt' | 'updatedAt'>>,
    userId: string,
    options?: { ignoreOwnership?: boolean }
  ): Promise<DatabaseConnection | null> {
    const db = await getDatabase();
    
    const updateDoc: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date(),
    };

    if (updates.password) {
      updateDoc.password = encrypt(updates.password);
    }

    const query: Record<string, unknown> = { _id: new ObjectId(id) };
    if (!options?.ignoreOwnership) {
      query.createdBy = userId;
    }

    const result = await db.collection('database_connections').findOneAndUpdate(
      query,
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id.toString(),
      name: result.name,
      type: result.type as DatabaseType,
      host: result.host,
      port: result.port,
      database: result.database,
      username: result.username,
      password: result.password,
      active: result.active !== undefined ? result.active : true,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      createdBy: result.createdBy,
    } as DatabaseConnection;
  }

  static async delete(id: string, userId: string, options?: { ignoreOwnership?: boolean }): Promise<boolean> {
    const db = await getDatabase();
    const query: Record<string, unknown> = { _id: new ObjectId(id) };
    if (!options?.ignoreOwnership) {
      query.createdBy = userId;
    }
    const result = await db.collection('database_connections').deleteOne(query);
    
    return result.deletedCount > 0;
  }

  static async testConnection(connection: DatabaseConnection): Promise<boolean> {
    try {
      if (connection.type === 'postgresql') {
        const driver = new PostgresDriver({
          host: connection.host,
          port: connection.port,
          database: connection.database,
          username: connection.username,
          password: connection.password,
        });
        return await driver.testConnection();
      } else if (connection.type === 'clickhouse') {
        const driver = new ClickHouseDriver({
          host: connection.host,
          port: connection.port,
          database: connection.database,
          username: connection.username,
          password: connection.password,
        });
        return await driver.testConnection();
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  static async listTables(connection: DatabaseConnection): Promise<string[]> {
    if (connection.type === 'postgresql') {
      const driver = new PostgresDriver({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
      });
      await driver.connect();
      try {
        return await driver.listTables();
      } finally {
        await driver.close();
      }
    } else if (connection.type === 'clickhouse') {
      const driver = new ClickHouseDriver({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
      });
      try {
        return await driver.listTables();
      } finally {
        await driver.close();
      }
    }
    return [];
  }

  static async listSchemas(connection: DatabaseConnection): Promise<string[]> {
    if (connection.type === 'postgresql') {
      const driver = new PostgresDriver({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
      });
      await driver.connect();
      try {
        return await driver.listSchemas();
      } finally {
        await driver.close();
      }
    } else if (connection.type === 'clickhouse') {
      // ClickHouse doesn't have schemas
      return [];
    }
    return [];
  }

  static async listTablesBySchema(connection: DatabaseConnection, schemaName: string): Promise<string[]> {
    if (connection.type === 'postgresql') {
      const driver = new PostgresDriver({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
      });
      await driver.connect();
      try {
        return await driver.listTablesBySchema(schemaName);
      } finally {
        await driver.close();
      }
    } else if (connection.type === 'clickhouse') {
      const driver = new ClickHouseDriver({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
      });
      try {
        return await driver.listTablesBySchema(schemaName);
      } finally {
        await driver.close();
      }
    }
    return [];
  }

  static async getTableColumns(connection: DatabaseConnection, tableName: string, schemaName?: string): Promise<unknown[]> {
    if (connection.type === 'postgresql') {
      const driver = new PostgresDriver({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
      });
      await driver.connect();
      try {
        return await driver.getTableSchema(tableName, schemaName);
      } finally {
        await driver.close();
      }
    } else if (connection.type === 'clickhouse') {
      const driver = new ClickHouseDriver({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
      });
      try {
        return await driver.getTableSchema(tableName, schemaName);
      } finally {
        await driver.close();
      }
    }
    return [];
  }

  // Removed selectTable and getSelectedTables - use DataSourceService instead
}

