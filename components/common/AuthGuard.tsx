'use client';

import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types/auth';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import PageContainer from '@/components/PageContainer';
import ErrorMessage from '@/components/ErrorMessage';
import InfoMessage from '@/components/ui/InfoMessage';
import Button from '@/components/ui/Button';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Required role to see content. If user doesn't have it, shows error. */
  requiredRole?: UserRole;
  /** When true, shows loading instead of children (e.g. data loading). */
  loading?: boolean;
  /** Callback when user clicks "На главную" on permission error. */
  onGoHome?: () => void;
}

export default function AuthGuard({ children, requiredRole, loading, onGoHome }: AuthGuardProps) {
  const router = useRouter();
  const { status, data } = useRequireAuthRedirect();
  const roles = data?.user?.roles ?? [];
  const hasRole = !requiredRole || roles.includes(requiredRole);

  if (status === 'unauthenticated') return null;
  if (status === 'loading' || loading) {
    return (
      <PageContainer>
        <InfoMessage message="Loading..." size="base" />
      </PageContainer>
    );
  }
  if (!hasRole) {
    const roleLabel = requiredRole ?? ('required' as string);
    return (
      <PageContainer>
        <ErrorMessage message={`Недостаточно прав. Требуется роль: ${roleLabel}.`} className="mb-4" />
        <Button onClick={onGoHome ?? (() => router.push('/'))} variant="secondary">
          На главную
        </Button>
      </PageContainer>
    );
  }

  return <>{children}</>;
}
