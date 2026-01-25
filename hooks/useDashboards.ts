import { useState, useEffect, useCallback } from 'react';
import { Dashboard } from '@/types/dashboard';
import { showAlert, showConfirm } from '@/lib/ui';

interface UseDashboardsReturn {
  dashboards: Dashboard[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  remove: (dashboardId: string, title: string) => Promise<boolean>;
}

export function useDashboards(): UseDashboardsReturn {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    load();
  }, [load]);

  return {
    dashboards,
    loading,
    error,
    load,
    remove,
  };
}
