'use client';

import { useDatabaseConnections } from '@/hooks/useDatabaseConnections';
import PageContainer from '@/components/PageContainer';
import AuthGuard from '@/components/common/AuthGuard';
import DatabaseConnectionsHeader from '@/components/database-connections/DatabaseConnectionsHeader';
import DatabaseConnectionsContent from '@/components/database-connections/DatabaseConnectionsContent';

export default function DatabaseConnectionsPage() {
  const { connections, loading, error, testingId, test, toggleActive, remove, onEdit } = useDatabaseConnections();

  return (
    <AuthGuard requiredRole="db_admin" loading={loading}>
      <PageContainer>
        <DatabaseConnectionsHeader />
        <DatabaseConnectionsContent
          connections={connections}
          testingId={testingId}
          error={error}
          onTest={test}
          onToggleActive={toggleActive}
          onEdit={onEdit}
          onDelete={remove}
        />
      </PageContainer>
    </AuthGuard>
  );
}
