import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UseRegisterReturn {
  email: string;
  password: string;
  confirmPassword: string;
  lastName: string;
  firstName: string;
  middleName: string;
  organization: string;
  department: string;
  error: string;
  loading: boolean;
  passwordsMismatch: boolean;
  canSubmit: boolean;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  setLastName: (v: string) => void;
  setFirstName: (v: string) => void;
  setMiddleName: (v: string) => void;
  setOrganization: (v: string) => void;
  setDepartment: (v: string) => void;
  submit: (e: React.FormEvent) => Promise<void>;
}

export function useRegister(): UseRegisterReturn {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [organization, setOrganization] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordsMismatch =
    password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;

  const canSubmit =
    !loading &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    lastName.trim().length > 0 &&
    firstName.trim().length > 0 &&
    confirmPassword.length > 0 &&
    !passwordsMismatch;

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            lastName,
            firstName,
            middleName: middleName || undefined,
            organization: organization || undefined,
            department: department || undefined,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || 'Registration failed');
          setLoading(false);
          return;
        }
        router.push('/login');
      } catch {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [
      email,
      password,
      confirmPassword,
      lastName,
      firstName,
      middleName,
      organization,
      department,
      router,
    ]
  );

  return {
    email,
    password,
    confirmPassword,
    lastName,
    firstName,
    middleName,
    organization,
    department,
    error,
    loading,
    passwordsMismatch,
    canSubmit,
    setEmail,
    setPassword,
    setConfirmPassword,
    setLastName,
    setFirstName,
    setMiddleName,
    setOrganization,
    setDepartment,
    submit,
  };
}
