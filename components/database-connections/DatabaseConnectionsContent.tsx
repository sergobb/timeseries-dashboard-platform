import { useRouter } from 'next/navigation';
import { DatabaseConnection } from '@/types/database';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState';
import DatabaseConnectionsTable from './DatabaseConnectionsTable';

interface DatabaseConnectionsContentProps {
  connections: DatabaseConnection[];
  testingId: string | null;
  error: string | null;
  onTest: (id: string) => void;
  onToggleActive: (id: string, currentActive: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export default function DatabaseConnectionsContent({
  connections,
  testingId,
  error,
  onTest,
  onToggleActive,
  onEdit,
  onDelete,
}: DatabaseConnectionsContentProps) {
  const router = useRouter();

  return (
    <>
      {error && <ErrorMessage message={error} className="mb-4" />}
      {connections.length === 0 ? (
        <EmptyState
          title="No database connections yet"
          description="Create your first connection to start adding data sources."
          actionLabel="New Connection"
          onAction={() => router.push('/database-connections/new')}
        />
      ) : (
        <DatabaseConnectionsTable
          connections={connections}
          testingId={testingId}
          onTest={onTest}
          onToggleActive={onToggleActive}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
