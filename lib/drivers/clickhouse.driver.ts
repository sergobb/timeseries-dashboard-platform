import { createClient, ClickHouseClient } from '@clickhouse/client';
import { DatabaseDriver } from './base.driver';
import { decrypt } from '@/lib/crypto';

export interface ClickHouseConnectionConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string; // encrypted
}

export class ClickHouseDriver implements DatabaseDriver {
  private client: ClickHouseClient;

  constructor(config: ClickHouseConnectionConfig) {
    const decryptedPassword = decrypt(config.password);
    this.client = createClient({
      host: `http://${config.host}:${config.port}`,
      username: config.username,
      password: decryptedPassword,
      database: config.database,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  async listTables(): Promise<string[]> {
    const result = await this.client.query({
      query: 'SHOW TABLES',
      format: 'JSONEachRow',
    });
    const data = await result.json();
    return (data as Array<Record<string, unknown>>).map((row) => String(Object.values(row)[0] ?? ''));
  }

  async listSchemas(): Promise<string[]> {
    // ClickHouse doesn't have schemas, return empty array or default database
    return [];
  }

  async listTablesBySchema(schemaName: string): Promise<string[]> {
    // ClickHouse doesn't have schemas, just return all tables
    return this.listTables();
  }

  async getTableSchema(tableName: string, schemaName?: string): Promise<unknown[]> {
    const result = await this.client.query({
      query: `DESCRIBE TABLE ${tableName}`,
      format: 'JSONEachRow',
    });
    const data = await result.json();
    type DescribeRow = { name: string; type: string };
    return (data as DescribeRow[]).map((row) => ({
      column_name: row.name,
      data_type: row.type,
      is_nullable: row.type.includes('Nullable'),
      column_default: null,
    }));
  }

  async query(sql: string, params?: unknown[]): Promise<unknown[]> {
    const result = await this.client.query({
      query: sql,
      format: 'JSONEachRow',
      query_params: params ? Object.fromEntries(params.map((p, i) => [`param${i}`, p])) : {},
    });
    const data = await result.json();
    return data as unknown[];
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}

