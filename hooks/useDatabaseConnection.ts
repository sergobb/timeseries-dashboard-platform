import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DatabaseType } from '@/types/database';

export interface DatabaseConnectionFormData {
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

interface UseDatabaseConnectionReturn {
  formData: DatabaseConnectionFormData;
  loading: boolean;
  loadingData: boolean;
  error: string | null;
  setFormData: React.Dispatch<React.SetStateAction<DatabaseConnectionFormData>>;
  updateField: <K extends keyof DatabaseConnectionFormData>(
    field: K,
    value: DatabaseConnectionFormData[K]
  ) => void;
  create: () => Promise<void>;
  update: (id: string) => Promise<void>;
  load: (id: string) => Promise<void>;
}

const defaultFormData: DatabaseConnectionFormData = {
  name: '',
  type: 'postgresql',
  host: '',
  port: 5432,
  database: '',
  username: '',
  password: '',
};

export function useDatabaseConnection(initialId?: string): UseDatabaseConnectionReturn {
  const router = useRouter();
  const [formData, setFormData] = useState<DatabaseConnectionFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback(<K extends keyof DatabaseConnectionFormData>(
    field: K,
    value: DatabaseConnectionFormData[K]
  ) => {
    setFormData((prev) => {
      if (field === 'type') {
        const newType = value as DatabaseType;
        const newPort = newType === 'postgresql' ? 5432 : 8123;
        return { ...prev, type: newType, port: newPort };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const load = useCallback(async (id: string) => {
    setLoadingData(true);
    setError(null);
    try {
      const response = await fetch(`/api/database-connections/${id}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch connection');
      const data = await response.json();
      setFormData({
        name: data.name || '',
        type: data.type || 'postgresql',
        host: data.host || '',
        port: data.port || 5432,
        database: data.database || '',
        username: data.username || '',
        password: '', // Don't populate password field for security
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connection');
    } finally {
      setLoadingData(false);
    }
  }, []);

  const create = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/database-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create connection');
      }
      router.push('/database-connections');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [formData, router]);

  const update = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updateData: Partial<DatabaseConnectionFormData> = {
        name: formData.name,
        host: formData.host,
        port: formData.port,
        database: formData.database,
        username: formData.username,
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/database-connections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update connection');
      }

      router.push('/database-connections');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [formData, router]);

  useEffect(() => {
    if (initialId) {
      load(initialId);
    }
  }, [initialId, load]);

  return {
    formData,
    loading,
    loadingData,
    error,
    setFormData,
    updateField,
    create,
    update,
    load,
  };
}
