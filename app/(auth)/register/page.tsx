'use client';

import { useRegister } from '@/hooks/useRegister';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const register = useRegister();
  return <RegisterForm {...register} />;
}
