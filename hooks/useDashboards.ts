import { useState, useEffect, useCallback } from 'react';
import { Dashboard } from '@/types/dashboard';
import { getLocalStorage, setLocalStorage } from '@/lib/localStorage';
import { showAlert, showConfirm } from '@/lib/ui';

interface UseDashboardsReturn {
  dashboards: Dashboard[];
  loading: boolean;
  error: string | null;
  filterText: string;
  setFilterText: (text: string) => void;
  filteredDashboards: Dashboard[];
  load: () => Promise<void>;
  remove: (dashboardId: string, title: string) => Promise<boolean>;
}

const STORAGE_KEY = 'dashboards-state';

export function useDashboards(): UseDashboardsReturn {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [restoring, setRestoring] = useState(true);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/dashboards', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch dashboards');
      const data = await response.json();
      setDashboards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (dashboardId: string, title: string): Promise<boolean> => {
    if (!showConfirm(`Are you sure you want to delete dashboard "${title}"?`)) {
      return false;
    }
    try {
      setError(null);
      const response = await fetch(`/api/dashboards/${dashboardId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete dashboard');
      }
      await load();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete dashboard';
      setError(message);
      showAlert(message);
      return false;
    }
  }, [load]);

  const filteredDashboards = dashboards.filter((dashboard) => {
    if (!filterText.trim()) return true;
    const searchText = filterText.toLowerCase();
    const description = (dashboard.description || '').toLowerCase();
    const title = (dashboard.title || '').toLowerCase();
    return description.includes(searchText) || title.includes(searchText);
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
    dashboards,
    loading,
    error,
    filterText,
    setFilterText,
    filteredDashboards,
    load,
    remove,
  };
}
