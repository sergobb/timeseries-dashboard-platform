import { useCallback, useEffect, useState } from 'react';
import { Group } from '@/types/group';

interface UseDashboardGroupsReturn {
  groups: Group[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useDashboardGroups(): UseDashboardGroupsReturn {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch('/api/groups', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to load groups');
      }
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    groups,
    loading,
    error,
    reload: load,
  };
}
