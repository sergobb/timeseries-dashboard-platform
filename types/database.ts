export type DatabaseType = 'postgresql' | 'clickhouse';

export interface DatabaseConnection {
  _id?: string;
  id: string;
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string; // encrypted
  active?: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // user id
}

/**
 * @deprecated Use DataSource from '@/types/data-source' instead
 * This interface is kept for backward compatibility only
 */
export interface SelectedTable {
  _id?: string;
  id: string;
  connectionId: string;
  tableName: string;
  schemaName?: string; // for PostgreSQL
  createdAt: Date;
  createdBy: string; // user id
}

