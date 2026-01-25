import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { GroupRole } from '@/types/group';
import { useUsers, UserSummary } from '@/hooks/useUsers';

interface UseGroupEditorState {
  name: string;
  description: string;
  role: GroupRole;
  memberIds: string[];
  ownerId: string | null;
  userFilter: string;
  selectedUsers: UserSummary[];
  availableUsers: UserSummary[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  usersError: string | null;
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  setRole: (value: GroupRole) => void;
  setUserFilter: (value: string) => void;
  addMember: (userId: string) => void;
  removeMember: (userId: string) => void;
  save: () => Promise<void>;
}

const buildFallbackUser = (id: string): UserSummary => ({
  id,
  email: 'Unknown user',
  firstName: '',
  lastName: '',
  middleName: null,
});

export function useGroupEditor(groupId?: string): UseGroupEditorState {
  const router = useRouter();
  const { data: session } = useSession();
  const { users, loading: usersLoading, error: usersError } = useUsers();
  const [name, setNameState] = useState('');
  const [description, setDescriptionState] = useState('');
  const [role, setRoleState] = useState<GroupRole>('view');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [userFilter, setUserFilterState] = useState('');
  const [loading, setLoading] = useState(!!groupId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usersById = useMemo(() => {
    const map = new Map<string, UserSummary>();
    users.forEach((user) => map.set(user.id, user));
    return map;
  }, [users]);

  const selectedUsers = useMemo(() => {
    return memberIds.map((id) => usersById.get(id) ?? buildFallbackUser(id));
  }, [memberIds, usersById]);

  const availableUsers = useMemo(() => {
    const filter = userFilter.trim().toLowerCase();
    return users.filter((user) => {
      if (memberIds.includes(user.id)) return false;
      if (!filter) return true;
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const middleName = (user.middleName || '').toLowerCase();
      return (
        user.email.toLowerCase().includes(filter) ||
        fullName.includes(filter) ||
        middleName.includes(filter)
      );
    });
  }, [memberIds, userFilter, users]);

  const loadGroup = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const response = await fetch(`/api/groups/${groupId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load group');
      }
      const data = await response.json();
      setNameState(data.name || '');
      setDescriptionState(data.description || '');
      setRoleState(data.role || 'view');
      setMemberIds(Array.isArray(data.memberIds) ? data.memberIds : []);
      setOwnerId(data.owner || data.createdBy || session?.user?.id || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group');
    } finally {
      setLoading(false);
    }
  }, [groupId, session?.user?.id]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  useEffect(() => {
    if (!groupId && session?.user?.id) {
      setMemberIds((prev) => (prev.includes(session.user.id) ? prev : [session.user.id, ...prev]));
      setOwnerId(session.user.id);
    }
  }, [groupId, session?.user?.id]);

  const setName = (value: string) => {
    setNameState(value);
    if (error) setError(null);
  };

  const setDescription = (value: string) => {
    setDescriptionState(value);
    if (error) setError(null);
  };

  const setRole = (value: GroupRole) => {
    setRoleState(value);
    if (error) setError(null);
  };

  const setUserFilter = (value: string) => {
    setUserFilterState(value);
  };

  const addMember = (userId: string) => {
    setMemberIds((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
  };

  const removeMember = (userId: string) => {
    if (ownerId && userId === ownerId) return;
    setMemberIds((prev) => prev.filter((id) => id !== userId));
  };

  const save = useCallback(async () => {
    if (!name.trim()) {
      setError('Group name is required.');
      return;
    }
    if (!description.trim()) {
      setError('Group description is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        role,
        memberIds,
      };
      const response = await fetch(groupId ? `/api/groups/${groupId}` : '/api/groups', {
        method: groupId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save group');
      }
      router.push('/groups');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save group');
    } finally {
      setSaving(false);
    }
  }, [description, groupId, memberIds, name, role, router]);

  return {
    name,
    description,
    role,
    memberIds,
    ownerId,
    userFilter,
    selectedUsers,
    availableUsers,
    loading: loading || usersLoading,
    saving,
    error,
    usersError,
    setName,
    setDescription,
    setRole,
    setUserFilter,
    addMember,
    removeMember,
    save,
  };
}
