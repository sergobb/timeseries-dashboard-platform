import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { DataSource } from '@/types/data-source';
import { ColumnMetadata } from '@/types/metadata';

interface UseDataSourceEditReturn {
  dataSource: DataSource | null;
  description: string;
  columns: ColumnMetadata[];
  loading: boolean;
  saving: boolean;
  uploading: boolean;
  error: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setDescription: (value: string) => void;
  toggleColumn: (index: number) => void;
  updateColumnDescription: (index: number, description: string) => void;
  uploadFile: (file: File) => Promise<void>;
  save: () => Promise<void>;
}

export function useDataSourceEdit(dataSourceId: string): UseDataSourceEditReturn {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [description, setDescription] = useState('');
  const [columns, setColumns] = useState<ColumnMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/data-sources/${dataSourceId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch data source');
      const data = await response.json();
      setDataSource(data);
      setDescription(data.description || '');
      setColumns(data.columns.map((col: ColumnMetadata) => ({
        ...col,
        active: col.active !== undefined ? col.active : true,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data source');
    } finally {
      setLoading(false);
    }
  }, [dataSourceId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleColumn = useCallback((index: number) => {
    setColumns(prev => {
      const newColumns = [...prev];
      newColumns[index] = {
        ...newColumns[index],
        active: !newColumns[index].active,
      };
      return newColumns;
    });
  }, []);

  const updateColumnDescription = useCallback((index: number, description: string) => {
    setColumns(prev => {
      const newColumns = [...prev];
      newColumns[index] = {
        ...newColumns[index],
        description,
      };
      return newColumns;
    });
  }, []);

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
    const result: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      result.push(row);
    }

    return result;
  };

  const parseExcel = (file: File): Promise<Record<string, string>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet) as Record<string, unknown>[];
          
          const result = jsonData.map((row: Record<string, unknown>) => {
            const converted: Record<string, string> = {};
            Object.keys(row).forEach(key => {
              converted[key] = String(row[key] || '');
            });
            return converted;
          });
          
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      let fileData: Record<string, string>[] = [];

      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        fileData = parseCSV(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        fileData = await parseExcel(file);
      } else {
        throw new Error('Неподдерживаемый формат файла. Используйте CSV или Excel (.xlsx, .xls)');
      }

      if (fileData.length === 0) {
        throw new Error('Файл пуст или не содержит данных');
      }

      const firstRow = fileData[0];
      const possibleColumnNameKeys = ['columnName', 'column_name', 'name', 'колонка', 'название'];
      const possibleDescriptionKeys = ['description', 'desc', 'описание', 'description'];

      const columnNameKey = possibleColumnNameKeys.find(key => 
        Object.keys(firstRow).some(k => k.toLowerCase() === key.toLowerCase())
      ) || Object.keys(firstRow)[0];

      const descriptionKey = possibleDescriptionKeys.find(key => 
        Object.keys(firstRow).some(k => k.toLowerCase() === key.toLowerCase())
      ) || Object.keys(firstRow)[1] || Object.keys(firstRow)[0];

      const fileMap = new Map<string, string>();
      fileData.forEach(row => {
        const colName = row[columnNameKey]?.trim();
        const desc = row[descriptionKey]?.trim();
        if (colName && desc) {
          fileMap.set(colName.toLowerCase(), desc);
        }
      });

      setColumns(prev => {
        const updated = prev.map(col => {
          const fileDesc = fileMap.get(col.columnName.toLowerCase());
          if (fileDesc) {
            return { ...col, description: fileDesc };
          }
          return col;
        });
        return updated;
      });

      const matchedCount = columns.filter((col, idx) => 
        fileMap.has(col.columnName.toLowerCase())
      ).length;

      if (matchedCount === 0) {
        setError('Не найдено совпадений. Убедитесь, что в файле есть колонка с именами колонок и описаниями.');
      } else {
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке файла');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [columns]);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/data-sources/${dataSourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          description,
          columns,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update data source');
      }

      router.push('/data-sources');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update data source');
    } finally {
      setSaving(false);
    }
  }, [dataSourceId, description, columns, router]);

  return {
    dataSource,
    description,
    columns,
    loading,
    saving,
    uploading,
    error,
    fileInputRef,
    setDescription,
    toggleColumn,
    updateColumnDescription,
    uploadFile,
    save,
  };
}
