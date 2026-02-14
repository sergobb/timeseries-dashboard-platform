import { ColumnMetadata } from './metadata';

export interface DataSource {
  _id?: string;
  id: string;
  connectionId: string;
  tableName: string;
  schemaName?: string; // for PostgreSQL
  description?: string;
  columns: ColumnMetadata[];
  tagIds?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // user id
}

