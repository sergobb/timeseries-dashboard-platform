'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import { UserProfile } from '@/types/profile';

interface UseProfileEditState {
  status: 'authenticated' | 'unauthenticated' | 'loading';
  profile: UserProfile | null;
  firstName: string;
  lastName: string;
  middleName: string;
  organization: string;
  department: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  loading: boolean;
  saving: boolean;
  success: boolean;
  error: string | null;
  passwordSaving: boolean;
  passwordSuccess: boolean;
  passwordError: string | null;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setMiddleName: (value: string) => void;
  setOrganization: (value: string) => void;
  setDepartment: (value: string) => void;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmNewPassword: (value: string) => void;
  save: () => Promise<void>;
  changePassword: () => Promise<void>;
  reload: () => Promise<void>;
}

export function useProfileEdit(): UseProfileEditState {
  const session = useRequireAuthRedirect();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstNameState] = useState('');
  const [lastName, setLastNameState] = useState('');
  const [middleName, setMiddleNameState] = useState('');
  const [organization, setOrganizationState] = useState('');
  const [department, setDepartmentState] = useState('');
  const [currentPassword, setCurrentPasswordState] = useState('');
  const [newPassword, setNewPasswordState] = useState('');
  const [confirmNewPassword, setConfirmNewPasswordState] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (session.status !== 'authenticated') return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load profile');
      }
      const data = (await res.json()) as UserProfile;
      setProfile(data);
      setFirstNameState(data.firstName || '');
      setLastNameState(data.lastName || '');
      setMiddleNameState(data.middleName ?? '');
      setOrganizationState(data.organization ?? '');
      setDepartmentState(data.department ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [session.status]);

  useEffect(() => {
    if (session.status === 'authenticated') {
      load();
    }
  }, [load, session.status]);

  const setFirstName = (value: string) => {
    setFirstNameState(value);
    if (success) setSuccess(false);
  };

  const setLastName = (value: string) => {
    setLastNameState(value);
    if (success) setSuccess(false);
  };

  const setMiddleName = (value: string) => {
    setMiddleNameState(value);
    if (success) setSuccess(false);
  };

  const setOrganization = (value: string) => {
    setOrganizationState(value);
    if (success) setSuccess(false);
  };

  const setDepartment = (value: string) => {
    setDepartmentState(value);
    if (success) setSuccess(false);
  };

  const setCurrentPassword = (value: string) => {
    setCurrentPasswordState(value);
    if (passwordSuccess) setPasswordSuccess(false);
    if (passwordError) setPasswordError(null);
  };

  const setNewPassword = (value: string) => {
    setNewPasswordState(value);
    if (passwordSuccess) setPasswordSuccess(false);
    if (passwordError) setPasswordError(null);
  };

  const setConfirmNewPassword = (value: string) => {
    setConfirmNewPasswordState(value);
    if (passwordSuccess) setPasswordSuccess(false);
    if (passwordError) setPasswordError(null);
  };

  const save = useCallback(async () => {
    if (session.status !== 'authenticated') return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: middleName.trim() ? middleName.trim() : null,
        organization: organization.trim() ? organization.trim() : null,
        department: department.trim() ? department.trim() : null,
      };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save profile');
      }
      const data = (await res.json()) as UserProfile;
      setProfile(data);
      setFirstNameState(data.firstName || '');
      setLastNameState(data.lastName || '');
      setMiddleNameState(data.middleName ?? '');
      setOrganizationState(data.organization ?? '');
      setDepartmentState(data.department ?? '');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }, [department, firstName, lastName, middleName, organization, session.status]);

  const changePassword = useCallback(async () => {
    if (session.status !== 'authenticated') return;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update password');
      }
      setCurrentPasswordState('');
      setNewPasswordState('');
      setConfirmNewPasswordState('');
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  }, [confirmNewPassword, currentPassword, newPassword, session.status]);

  return {
    status: session.status,
    profile,
    firstName,
    lastName,
    middleName,
    organization,
    department,
    currentPassword,
    newPassword,
    confirmNewPassword,
    loading,
    saving,
    success,
    error,
    passwordSaving,
    passwordSuccess,
    passwordError,
    setFirstName,
    setLastName,
    setMiddleName,
    setOrganization,
    setDepartment,
    setCurrentPassword,
    setNewPassword,
    setConfirmNewPassword,
    save,
    changePassword,
    reload: load,
  };
}
