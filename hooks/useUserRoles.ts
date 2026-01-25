import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserRole } from '@/types/auth';

export interface UserWithRoles {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  roles: UserRole[];
}

interface UseUserRolesReturn {
  users: UserWithRolesState[];
  availableRoles: UserRole[];
  loading: boolean;
  error: string | null;
  toggleRole: (userId: string, role: UserRole) => void;
  saveAll: () => Promise<void>;
  savingAll: boolean;
  hasChanges: boolean;
  reload: () => Promise<void>;
}

export interface UserWithRolesState extends UserWithRoles {
  isDirty: boolean;
}

const availableRoles: UserRole[] = [
  'db_admin',
  'metadata_editor',
  'dashboard_creator',
  'public',
  'user_admin',
];

export function useUserRoles(enabled: boolean = true): UseUserRolesReturn {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [dirtyUserIds, setDirtyUserIds] = useState<Set<string>>(new Set());
  const [savingAll, setSavingAll] = useState(false);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const response = await fetch('/api/users/roles', {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
      setDirtyUserIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleRole = useCallback((userId: string, role: UserRole) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) return user;
        const hasRole = user.roles.includes(role);
        const nextRoles = hasRole
          ? user.roles.filter((item) => item !== role)
          : [...user.roles, role];
        return { ...user, roles: nextRoles };
      })
    );
    setDirtyUserIds((prev) => {
      const next = new Set(prev);
      next.add(userId);
      return next;
    });
  }, []);

  const saveAll = useCallback(async () => {
    if (savingAll || dirtyUserIds.size === 0) return;

    const dirtyUsers = users.filter((user) => dirtyUserIds.has(user.id));
    if (dirtyUsers.length === 0) return;

    try {
      setError(null);
      setSavingAll(true);

      const results = await Promise.all(
        dirtyUsers.map(async (user) => {
          const response = await fetch('/api/users/roles', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id: user.id, roles: user.roles }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to update roles');
          }

          const data = await response.json();
          return { id: user.id, roles: data.roles || [] };
        })
      );

      const rolesById = new Map(results.map((item) => [item.id, item.roles]));
      setUsers((prev) =>
        prev.map((user) => {
          const roles = rolesById.get(user.id);
          return roles ? { ...user, roles } : user;
        })
      );
      setDirtyUserIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update roles');
    } finally {
      setSavingAll(false);
    }
  }, [dirtyUserIds, savingAll, users]);

  const usersWithState = useMemo<UserWithRolesState[]>(() => {
    return users.map((user) => ({
      ...user,
      isDirty: dirtyUserIds.has(user.id),
    }));
  }, [dirtyUserIds, users]);

  return {
    users: usersWithState,
    availableRoles,
    loading,
    error,
    toggleRole,
    saveAll,
    savingAll,
    hasChanges: dirtyUserIds.size > 0,
    reload: load,
  };
}
