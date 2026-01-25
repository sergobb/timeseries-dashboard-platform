'use client';

import PageContainer from '@/components/PageContainer';
import ErrorMessage from '@/components/ErrorMessage';
import InfoMessage from '@/components/ui/InfoMessage';
import UsersHeader from '@/components/users/UsersHeader';
import UsersContent from '@/components/users/UsersContent';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import { useUserRoles } from '@/hooks/useUserRoles';

export default function UsersPage() {
  const { status, data } = useRequireAuthRedirect();
  const roles = data?.user?.roles ?? [];
  const canManageUsers = roles.includes('user_admin');
  const { users, availableRoles, loading, error, toggleRole, saveAll, savingAll, hasChanges } = useUserRoles(
    status === 'authenticated' && canManageUsers
  );

  if (status === 'loading' || loading) {
    return (
      <PageContainer>
        <InfoMessage message="Loading..." size="base" />
      </PageContainer>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (!canManageUsers) {
    return (
      <PageContainer>
        <ErrorMessage message="Недостаточно прав. Требуется роль: user_admin." />
      </PageContainer>
    );
  }

  return (
    <PageContainer flex innerClassName="h-full flex flex-col min-h-0">
      <UsersHeader onSave={saveAll} saving={savingAll} disabled={!hasChanges} />
      <UsersContent
        users={users}
        availableRoles={availableRoles}
        error={error}
        onToggleRole={toggleRole}
      />
    </PageContainer>
  );
}
