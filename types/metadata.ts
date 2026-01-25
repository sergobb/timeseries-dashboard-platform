export interface ColumnMetadata {
  columnName: string;
  dataType: string;
  description?: string;
  unit?: string; // единицы измерения
  minValue?: number;
  maxValue?: number;
  format?: string; // формат отображения
  active?: boolean; // активна ли колонка (по умолчанию true)
  customFields?: Record<string, unknown>; // дополнительные пользовательские поля
}

/**
 * @deprecated Use DataSource from '@/types/data-source' instead
 * This interface is kept for backward compatibility only
 */
export interface TableMetadata {
  _id?: string;
  id: string;
  tableId: string; // ссылка на SelectedTable (deprecated)
  tableName: string;
  description?: string;
  columns: ColumnMetadata[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // user id
}

