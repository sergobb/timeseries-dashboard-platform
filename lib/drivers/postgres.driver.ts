import { Client } from 'pg';
import { DatabaseDriver } from './base.driver';
import { decrypt } from '@/lib/crypto';

export interface PostgresConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string; // encrypted
}

export class PostgresDriver implements DatabaseDriver {
  private client: Client;

  constructor(config: PostgresConnectionConfig) {
    const decryptedPassword = decrypt(config.password);
    this.client = new Client({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: decryptedPassword,
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect();
      await this.client.query('SELECT 1');
      await this.close();
      return true;
    } catch (error) {
      return false;
    }
  }

  async listTables(): Promise<string[]> {
    if (!this.client) {
      await this.connect();
    }
    const result = await this.client.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `);
    type Row = { table_name: string; table_schema: string };
    return (result.rows as Row[]).map((row) =>
      row.table_schema !== 'public' ? `${row.table_schema}.${row.table_name}` : row.table_name
    );
  }

  async listSchemas(): Promise<string[]> {
    if (!this.client) {
      await this.connect();
    }
    const result = await this.client.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY schema_name
    `);
    type Row = { schema_name: string };
    return (result.rows as Row[]).map((row) => row.schema_name);
  }

  async listTablesBySchema(schemaName: string): Promise<string[]> {
    if (!this.client) {
      await this.connect();
    }
    const result = await this.client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = $1
      ORDER BY table_name
    `, [schemaName]);
    type Row = { table_name: string };
    return (result.rows as Row[]).map((row) => row.table_name);
  }

  async getTableSchema(tableName: string, schemaName?: string): Promise<unknown[]> {
    if (!this.client) {
      await this.connect();
    }
    const [schema, table] = tableName.includes('.') 
      ? tableName.split('.') 
      : [schemaName || 'public', tableName];
    
    const result = await this.client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position
    `, [schema, table]);
    
    return result.rows;
  }

  async query(sql: string, params?: unknown[]): Promise<unknown[]> {
    if (!this.client) {
      await this.connect();
    }

    const result = await this.client.query(sql, params);
    return result.rows;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.end();
    }
  }
}

