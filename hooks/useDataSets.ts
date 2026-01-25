import { useState, useEffect, useCallback } from 'react';
import { DataSet } from '@/types/data-set';
import { getLocalStorage, setLocalStorage } from '@/lib/localStorage';
import { showAlert, showConfirm } from '@/lib/ui';

interface UseDataSetsReturn {
  dataSets: DataSet[];
  loading: boolean;
  error: string | null;
  filterText: string;
  setFilterText: (text: string) => void;
  filteredDataSets: DataSet[];
  load: () => Promise<void>;
  remove: (dataSetId: string, description?: string) => Promise<boolean>;
}

const STORAGE_KEY = 'data-sets-state';

export function useDataSets(): UseDataSetsReturn {
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [restoring, setRestoring] = useState(true);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/data-sets', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch data sets');
      const data = await response.json();
      setDataSets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data sets');
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (dataSetId: string, description?: string): Promise<boolean> => {
    const confirmMessage = description
      ? `Are you sure you want to delete data set "${description}"?`
      : 'Are you sure you want to delete this data set?';
    
    if (!showConfirm(confirmMessage)) {
      return false;
    }
    try {
      setError(null);
      const response = await fetch(`/api/data-sets/${dataSetId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete data set');
      }
      await load();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete data set';
      setError(message);
      showAlert(message);
      return false;
    }
  }, [load]);

  const filteredDataSets = dataSets.filter((dataSet) => {
    if (!filterText.trim()) return true;
    const searchText = filterText.toLowerCase();
    const description = (dataSet.description || '').toLowerCase();
    return description.includes(searchText);
  });

  useEffect(() => {
    const savedState = getLocalStorage<{ filterText?: string }>(STORAGE_KEY);
    if (savedState?.filterText !== undefined) {
      setFilterText(savedState.filterText);
    }
    setRestoring(false);
    load();
  }, [load]);

  useEffect(() => {
    if (!restoring) {
      setLocalStorage(STORAGE_KEY, { filterText });
    }
  }, [filterText, restoring]);

  return {
    dataSets,
    loading,
    error,
    filterText,
    setFilterText,
    filteredDataSets,
    load,
    remove,
  };
}
