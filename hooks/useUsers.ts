import { useCallback, useEffect, useState } from 'react';
import { User } from '@/types/auth';

export type UserSummary = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'middleName'>;

interface UseUsersReturn {
  users: UserSummary[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/users', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    users,
    loading,
    error,
    reload: load,
  };
}
