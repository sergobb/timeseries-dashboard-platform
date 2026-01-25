'use client';

import IconButton from '@/components/ui/IconButton';
import { TestIcon, PlayIcon, PauseIcon, EditIcon, DeleteIcon, LoadingSpinner } from '@/components/ui/icons';
import { DatabaseConnection } from '@/types/database';

interface DatabaseConnectionsTableProps {
  connections: DatabaseConnection[];
  testingId: string | null;
  onTest: (id: string) => void;
  onToggleActive: (id: string, currentActive: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export default function DatabaseConnectionsTable({
  connections,
  testingId,
  onTest,
  onToggleActive,
  onEdit,
  onDelete,
}: DatabaseConnectionsTableProps) {
  if (connections.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow">
        <p className="text-[var(--color-muted-foreground)]">
          No database connections found. Create your first connection to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-[var(--color-border)]">
        <thead className="bg-[var(--color-surface-muted)]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Host
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Database
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--color-surface)] divide-y divide-[var(--color-border)]">
          {connections.map((connection) => (
            <tr key={connection.id} className="hover:bg-[var(--color-surface-muted)]">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-[var(--color-foreground)]">
                  {connection.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-[var(--color-muted-foreground)]">
                  {connection.type === 'postgresql' ? 'PostgreSQL' : 'ClickHouse'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-[var(--color-muted-foreground)]">
                  {connection.host}:{connection.port}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-[var(--color-muted-foreground)]">
                  {connection.database}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    connection.active !== false
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]'
                  }`}
                >
                  {connection.active !== false ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <IconButton
                    onClick={() => onTest(connection.id)}
                    disabled={testingId === connection.id}
                    variant="primary"
                    icon={testingId === connection.id ? <LoadingSpinner /> : <TestIcon />}
                    tooltip="Test connection"
                  />
                  <IconButton
                    onClick={() => onToggleActive(connection.id, connection.active !== false)}
                    variant="secondary"
                    icon={connection.active !== false ? <PauseIcon /> : <PlayIcon />}
                    tooltip={connection.active !== false ? 'Deactivate' : 'Activate'}
                  />
                  <IconButton
                    onClick={() => onEdit(connection.id)}
                    variant="success"
                    icon={<EditIcon className="w-4 h-4" />}
                    tooltip="Edit"
                  />
                  <IconButton
                    onClick={() => onDelete(connection.id, connection.name)}
                    variant="danger"
                    icon={<DeleteIcon className="w-4 h-4" />}
                    tooltip="Delete"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

