export interface DatabaseDriver {
  connect?(): Promise<void>;
  testConnection(): Promise<boolean>;
  listTables(): Promise<string[]>;
  listSchemas(): Promise<string[]>;
  listTablesBySchema(schemaName: string): Promise<string[]>;
  getTableSchema(tableName: string, schemaName?: string): Promise<unknown[]>;
  query(sql: string, params?: unknown[]): Promise<unknown[]>;
  close(): Promise<void>;
}

