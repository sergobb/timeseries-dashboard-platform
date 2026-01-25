import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DatabaseConnection } from '@/types/database';
import { DataSource } from '@/types/data-source';
import { getLocalStorage, setLocalStorage } from '@/lib/localStorage';

interface UseDataSourceCreationReturn {
  connections: DatabaseConnection[];
  existingDataSources: DataSource[];
  selectedConnectionId: string | null;
  selectedSchema: string | null;
  schemas: string[];
  tables: string[];
  selectedTables: Set<string>;
  connectionFilter: string;
  schemaFilter: string;
  tableFilter: string;
  loading: boolean;
  loadingSchemas: boolean;
  loadingTables: boolean;
  adding: boolean;
  error: string | null;
  setConnectionFilter: (value: string) => void;
  setSchemaFilter: (value: string) => void;
  setTableFilter: (value: string) => void;
  selectConnection: (id: string) => Promise<void>;
  selectSchema: (schema: string) => Promise<void>;
  toggleTable: (tableName: string) => void;
  selectAllTables: () => void;
  addDataSources: () => Promise<void>;
}

const STORAGE_KEY = 'data-sources-new-state';

export function useDataSourceCreation(): UseDataSourceCreationReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [existingDataSources, setExistingDataSources] = useState<DataSource[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
  const [schemas, setSchemas] = useState<string[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [connectionFilter, setConnectionFilter] = useState('');
  const [schemaFilter, setSchemaFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSchemas, setLoadingSchemas] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [stateRestored, setStateRestored] = useState(false);

  const updateURL = useCallback((connectionId: string | null, schema: string | null) => {
    const params = new URLSearchParams();
    if (connectionId) params.set('connection', connectionId);
    if (schema !== null && schema !== '') params.set('schema', schema);
    const queryString = params.toString();
    const newUrl = queryString ? `/data-sources/new?${queryString}` : '/data-sources/new';
    router.replace(newUrl, { scroll: false });
  }, [router]);

  const loadConnections = useCallback(async () => {
    try {
      const response = await fetch('/api/database-connections', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch connections');
      const data = await response.json();
      setConnections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDataSources = useCallback(async () => {
    try {
      const response = await fetch('/api/data-sources', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setExistingDataSources(data);
      }
    } catch (err) {
      console.error('Failed to fetch data sources:', err);
    }
  }, []);

  const loadSchemas = useCallback(async (connectionId: string): Promise<string[]> => {
    const response = await fetch(`/api/database-connections/${connectionId}/schemas`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch schemas');
    const data = await response.json();
    return data.schemas || [];
  }, []);

  const loadTables = useCallback(async (connectionId: string, schema: string | null) => {
    const schemaParam = schema || 'default';
    const response = await fetch(
      `/api/database-connections/${connectionId}/schemas/${encodeURIComponent(schemaParam)}/tables`,
      { credentials: 'include' }
    );
    if (!response.ok) throw new Error('Failed to fetch tables');
    const data = await response.json();
    return data.tables || [];
  }, []);

  useEffect(() => {
    setRestoring(true);
    const savedState = getLocalStorage<{
      connectionFilter?: string;
      schemaFilter?: string;
      tableFilter?: string;
      selectedConnectionId?: string;
      selectedSchema?: string | null;
      selectedTables?: string[];
    }>(STORAGE_KEY);

    if (savedState) {
      if (savedState.connectionFilter !== undefined) setConnectionFilter(savedState.connectionFilter);
      if (savedState.schemaFilter !== undefined) setSchemaFilter(savedState.schemaFilter);
      if (savedState.tableFilter !== undefined) setTableFilter(savedState.tableFilter);
    }

    loadConnections();
    loadDataSources();
    setRestoring(false);
  }, []);

  const selectConnection = useCallback(async (connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setSelectedSchema(null);
    setTables([]);
    setSelectedTables(new Set());
    setSchemaFilter('');
    setTableFilter('');
    setLoadingSchemas(true);
    setError(null);
    updateURL(connectionId, null);

    try {
      const schemasData = await loadSchemas(connectionId);
      setSchemas(schemasData);

      const connection = connections.find(c => c.id === connectionId);
      if (connection?.type === 'clickhouse') {
        setSelectedSchema('');
        updateURL(connectionId, '');
        setLoadingTables(true);
        try {
          const tablesData = await loadTables(connectionId, null);
          setTables(tablesData);
          setSelectedTables(new Set());
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load tables');
        } finally {
          setLoadingTables(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schemas');
    } finally {
      setLoadingSchemas(false);
    }
  }, [connections, loadSchemas, loadTables, updateURL]);

  const selectSchema = useCallback(async (schemaName: string) => {
    if (!selectedConnectionId) return;

    setSelectedSchema(schemaName);
    setSelectedTables(new Set());
    setTableFilter('');
    setLoadingTables(true);
    setError(null);
    updateURL(selectedConnectionId, schemaName);

    try {
      const tablesData = await loadTables(selectedConnectionId, schemaName);
      setTables(tablesData);
      setSelectedTables(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tables');
    } finally {
      setLoadingTables(false);
    }
  }, [selectedConnectionId, loadTables, updateURL]);

  useEffect(() => {
    if (connections.length === 0 || stateRestored) return;

    const connectionParam = searchParams.get('connection');
    const schemaParam = searchParams.get('schema');
    const savedState = getLocalStorage<{
      selectedConnectionId?: string;
      selectedSchema?: string | null;
      selectedTables?: string[];
    }>(STORAGE_KEY);

    const connectionToRestore = connectionParam || savedState?.selectedConnectionId;
    const schemaToRestore = schemaParam !== null ? schemaParam : savedState?.selectedSchema;

    if (connectionToRestore) {
      const connection = connections.find(c => c.id === connectionToRestore);
      if (connection) {
        setStateRestored(true);
        selectConnection(connectionToRestore).then(() => {
          if (schemaToRestore !== null && schemaToRestore !== undefined) {
            if (schemaToRestore === '') {
              setRestoring(false);
            } else {
              selectSchema(schemaToRestore).then(() => {
                setRestoring(false);
              });
            }
          } else {
            setRestoring(false);
          }
        });
      } else {
        setStateRestored(true);
        setRestoring(false);
      }
    } else {
      setStateRestored(true);
      setRestoring(false);
    }
  }, [connections, searchParams, stateRestored, selectConnection, selectSchema]);

  useEffect(() => {
    if (!restoring) {
      setLocalStorage(STORAGE_KEY, {
        connectionFilter,
        schemaFilter,
        tableFilter,
        selectedConnectionId,
        selectedSchema,
        selectedTables: Array.from(selectedTables),
      });
    }
  }, [connectionFilter, schemaFilter, tableFilter, selectedConnectionId, selectedSchema, selectedTables, restoring]);

  const toggleTable = useCallback((tableName: string) => {
    const isExisting = existingDataSources.some(
      ds => ds.connectionId === selectedConnectionId &&
      ds.tableName === tableName &&
      (ds.schemaName || null) === (selectedSchema || null)
    );
    if (isExisting) return;

    setSelectedTables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tableName)) {
        newSet.delete(tableName);
      } else {
        newSet.add(tableName);
      }
      return newSet;
    });
  }, [existingDataSources, selectedConnectionId, selectedSchema]);

  const selectAllTables = useCallback(() => {
    if (!selectedConnectionId) return;

    const availableTables = tables.filter(table => {
      if (tableFilter && !table.toLowerCase().includes(tableFilter.toLowerCase())) {
        return false;
      }
      return !existingDataSources.some(
        ds => ds.connectionId === selectedConnectionId &&
        ds.tableName === table &&
        (ds.schemaName || null) === (selectedSchema || null)
      );
    });

    const allSelected = availableTables.length > 0 && availableTables.every(table => selectedTables.has(table));

    if (allSelected) {
      setSelectedTables(prev => {
        const newSet = new Set(prev);
        availableTables.forEach(table => newSet.delete(table));
        return newSet;
      });
    } else {
      setSelectedTables(prev => {
        const newSet = new Set(prev);
        availableTables.forEach(table => newSet.add(table));
        return newSet;
      });
    }
  }, [selectedConnectionId, tables, tableFilter, existingDataSources, selectedSchema, selectedTables]);

  const addDataSources = useCallback(async () => {
    if (!selectedConnectionId || selectedTables.size === 0) {
      setError('Please select at least one table');
      return;
    }

    setAdding(true);
    setError(null);

    try {
      const tablesToAdd = Array.from(selectedTables).map(tableName => ({
        tableName,
        schemaName: selectedSchema || undefined,
      }));

      const response = await fetch('/api/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          connectionId: selectedConnectionId,
          tables: tablesToAdd,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add data sources');
      }

      await loadDataSources();

      if (selectedConnectionId) {
        const schemaParam = selectedSchema || 'default';
        const tablesData = await loadTables(selectedConnectionId, selectedSchema);
        setTables(tablesData);
        setSelectedTables(new Set());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add data sources');
    } finally {
      setAdding(false);
    }
  }, [selectedConnectionId, selectedSchema, selectedTables, loadDataSources, loadTables]);

  return {
    connections,
    existingDataSources,
    selectedConnectionId,
    selectedSchema,
    schemas,
    tables,
    selectedTables,
    connectionFilter,
    schemaFilter,
    tableFilter,
    loading,
    loadingSchemas,
    loadingTables,
    adding,
    error,
    setConnectionFilter,
    setSchemaFilter,
    setTableFilter,
    selectConnection,
    selectSchema,
    toggleTable,
    selectAllTables,
    addDataSources,
  };
}
