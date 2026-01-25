import { DatabaseConnection } from '@/types/database';
import ErrorMessage from '@/components/ErrorMessage';
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
  return (
    <>
      {error && <ErrorMessage message={error} className="mb-4" />}
      <DatabaseConnectionsTable
        connections={connections}
        testingId={testingId}
        onTest={onTest}
        onToggleActive={onToggleActive}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
}
