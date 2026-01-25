import { useState, useEffect, useCallback } from 'react';
import { DatabaseConnection } from '@/types/database';
import { showAlert, showConfirm } from '@/lib/ui';

interface UseDatabaseConnectionsReturn {
  connections: DatabaseConnection[];
  loading: boolean;
  error: string | null;
  testingId: string | null;
  load: () => Promise<void>;
  test: (id: string) => Promise<void>;
  toggleActive: (id: string, currentActive: boolean) => Promise<void>;
  remove: (id: string, name: string) => Promise<boolean>;
}

export function useDatabaseConnections(): UseDatabaseConnectionsReturn {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
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

  const test = useCallback(async (id: string) => {
    setTestingId(id);
    try {
      const response = await fetch(`/api/database-connections/${id}/test`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.valid) {
        showAlert('Connection test successful!');
      } else {
        showAlert('Connection test failed!');
      }
    } catch (err) {
      showAlert('Connection test failed!');
    } finally {
      setTestingId(null);
    }
  }, []);

  const toggleActive = useCallback(async (id: string, currentActive: boolean) => {
    try {
      setError(null);
      const response = await fetch(`/api/database-connections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ active: !currentActive }),
      });
      if (!response.ok) throw new Error('Failed to update connection');
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update connection';
      setError(message);
      showAlert(message);
    }
  }, [load]);

  const remove = useCallback(async (id: string, name: string): Promise<boolean> => {
    if (!showConfirm(`Are you sure you want to delete connection "${name}"?`)) {
      return false;
    }
    try {
      setError(null);
      const response = await fetch(`/api/database-connections/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete connection');
      await load();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete connection';
      setError(message);
      showAlert(message);
      return false;
    }
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    connections,
    loading,
    error,
    testingId,
    load,
    test,
    toggleActive,
    remove,
  };
}
