import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DataSource } from '@/types/data-source';
import { getLocalStorage, setLocalStorage } from '@/lib/localStorage';
import { showAlert, showConfirm } from '@/lib/ui';

interface UseDataSourcesReturn {
  dataSources: DataSource[];
  loading: boolean;
  error: string | null;
  filterText: string;
  setFilterText: (text: string) => void;
  filterTagIds: string[];
  toggleFilterTag: (tagId: string) => void;
  filteredDataSources: DataSource[];
  load: () => Promise<void>;
  remove: (dataSourceId: string, tableName: string) => Promise<boolean>;
  onEdit: (dataSourceId: string) => void;
}

const STORAGE_KEY = 'data-sources-state';

export function useDataSources(): UseDataSourcesReturn {
  const router = useRouter();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [filterTagIds, setFilterTagIds] = useState<string[]>([]);
  const [restoring, setRestoring] = useState(true);

  const toggleFilterTag = useCallback((tagId: string) => {
    setFilterTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }, []);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/data-sources', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch data sources');
      const data = await response.json();
      setDataSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data sources');
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (dataSourceId: string, tableName: string): Promise<boolean> => {
    if (!showConfirm(`Are you sure you want to delete data source "${tableName}"?`)) {
      return false;
    }
    try {
      setError(null);
      const response = await fetch(`/api/data-sources/${dataSourceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete data source');
      }
      await load();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete data source';
      setError(message);
      showAlert(message);
      return false;
    }
  }, [load]);

  const filteredDataSources = dataSources.filter((dataSource) => {
    if (filterTagIds.length > 0) {
      const itemTagIds = dataSource.tagIds || [];
      const hasAllTags = filterTagIds.every((id) => itemTagIds.includes(id));
      if (!hasAllTags) return false;
    }
    if (!filterText.trim()) return true;
    const searchText = filterText.toLowerCase();
    const schemaName = (dataSource.schemaName || '').toLowerCase();
    const tableName = dataSource.tableName.toLowerCase();
    const description = (dataSource.description || '').toLowerCase();
    return (
      schemaName.includes(searchText) ||
      tableName.includes(searchText) ||
      description.includes(searchText)
    );
  });

  useEffect(() => {
    const savedState = getLocalStorage<{ filterText?: string; filterTagIds?: string[] }>(STORAGE_KEY);
    if (savedState?.filterText !== undefined) {
      setFilterText(savedState.filterText);
    }
    if (Array.isArray(savedState?.filterTagIds)) {
      setFilterTagIds(savedState.filterTagIds);
    }
    setRestoring(false);
    load();
  }, [load]);

  useEffect(() => {
    if (!restoring) {
      setLocalStorage(STORAGE_KEY, { filterText, filterTagIds });
    }
  }, [filterText, filterTagIds, restoring]);

  const onEdit = useCallback((dataSourceId: string) => router.push(`/data-sources/${dataSourceId}/edit`), [router]);

  return {
    dataSources,
    loading,
    error,
    filterText,
    setFilterText,
    filterTagIds,
    toggleFilterTag,
    filteredDataSources,
    load,
    remove,
    onEdit,
  };
}
