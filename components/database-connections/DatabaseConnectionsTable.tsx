'use client';

import IconButton from '@/components/ui/IconButton';
import Badge from '@/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Host</TableHead>
          <TableHead>Database</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {connections.map((connection) => (
          <TableRow key={connection.id}>
            <TableCell className="whitespace-nowrap font-medium">
              {connection.name}
            </TableCell>
            <TableCell className="whitespace-nowrap text-[var(--color-muted-foreground)]">
              {connection.type === 'postgresql' ? 'PostgreSQL' : 'ClickHouse'}
            </TableCell>
            <TableCell className="whitespace-nowrap text-[var(--color-muted-foreground)]">
              {connection.host}:{connection.port}
            </TableCell>
            <TableCell className="whitespace-nowrap text-[var(--color-muted-foreground)]">
              {connection.database}
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <Badge variant={connection.active !== false ? 'success' : 'default'}>
                {connection.active !== false ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="whitespace-nowrap text-right">
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
                  variant="secondary"
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

