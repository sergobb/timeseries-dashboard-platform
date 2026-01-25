'use client';

import { useRouter } from 'next/navigation';
import { useDatabaseConnections } from '@/hooks/useDatabaseConnections';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import PageContainer from '@/components/PageContainer';
import ErrorMessage from '@/components/ErrorMessage';
import InfoMessage from '@/components/ui/InfoMessage';
import DatabaseConnectionsHeader from '@/components/database-connections/DatabaseConnectionsHeader';
import DatabaseConnectionsContent from '@/components/database-connections/DatabaseConnectionsContent';

export default function DatabaseConnectionsPage() {
  const router = useRouter();
  const { status, data } = useRequireAuthRedirect();
  const { connections, loading, error, testingId, test, toggleActive, remove } = useDatabaseConnections();
  const roles = data?.user?.roles ?? [];
  const canViewConnections = roles.includes('db_admin');

  const handleEdit = (id: string) => {
    router.push(`/database-connections/${id}/edit`);
  };

  if (status === 'unauthenticated') {
    return null;
  }

  if (status === 'loading' || loading) {
    return (
      <PageContainer>
        <InfoMessage message="Loading..." size="base" />
      </PageContainer>
    );
  }

  if (!canViewConnections) {
    return (
      <PageContainer>
        <ErrorMessage message="Недостаточно прав. Требуется роль: db_admin." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DatabaseConnectionsHeader />
      <DatabaseConnectionsContent
        connections={connections}
        testingId={testingId}
        error={error}
        onTest={test}
        onToggleActive={toggleActive}
        onEdit={handleEdit}
        onDelete={remove}
      />
    </PageContainer>
  );
}
