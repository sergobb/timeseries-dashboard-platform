import { useCallback, useEffect, useState } from 'react';
import { Group } from '@/types/group';
import { getLocalStorage, setLocalStorage } from '@/lib/localStorage';
import { showAlert, showConfirm } from '@/lib/ui';

interface UseGroupsReturn {
  groups: Group[];
  loading: boolean;
  error: string | null;
  filterText: string;
  setFilterText: (text: string) => void;
  filteredGroups: Group[];
  load: () => Promise<void>;
  remove: (groupId: string, name: string) => Promise<boolean>;
}

const STORAGE_KEY = 'groups-state';

export function useGroups(): UseGroupsReturn {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [restoring, setRestoring] = useState(true);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/groups', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch groups');
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (groupId: string, name: string): Promise<boolean> => {
    if (!showConfirm(`Are you sure you want to delete group "${name}"?`)) {
      return false;
    }
    try {
      setError(null);
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete group');
      }
      await load();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete group';
      setError(message);
      showAlert(message);
      return false;
    }
  }, [load]);

  const filteredGroups = groups.filter((group) => {
    if (!filterText.trim()) return true;
    const searchText = filterText.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchText) ||
      group.description.toLowerCase().includes(searchText)
    );
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
    groups,
    loading,
    error,
    filterText,
    setFilterText,
    filteredGroups,
    load,
    remove,
  };
}
