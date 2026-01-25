'use client';

import { useMemo } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import PageContainer from '@/components/PageContainer';
import PageTitle from '@/components/ui/PageTitle';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import InfoMessage from '@/components/ui/InfoMessage';
import PageHeader from '@/components/ui/PageHeader';
import { CloseIcon } from '@/components/ui/icons';
import DataSourcesGrid from '@/components/data-sources/DataSourcesGrid';
import DataSourcesPanel from '@/components/data-sources/DataSourcesPanel';
import { DatabaseConnection } from '@/types/database';
import { DataSource } from '@/types/data-source';

interface NewDataSourceContentProps {
  connections: DatabaseConnection[];
  existingDataSources: DataSource[];
  selectedConnectionId: string | null;
  selectedSchema: string | null;
  schemas: string[];
  tables: string[];
  selectedTables: Set<string>;
  connectionFilter: string;
  schemaFilter: string;
  tableFilter: string;
  loadingSchemas: boolean;
  loadingTables: boolean;
  adding: boolean;
  error: string | null;
  setConnectionFilter: (value: string) => void;
  setSchemaFilter: (value: string) => void;
  setTableFilter: (value: string) => void;
  selectConnection: (id: string) => void;
  selectSchema: (schema: string) => void;
  toggleTable: (tableName: string) => void;
  selectAllTables: () => void;
  addDataSources: () => void;
  onClose: () => void;
}

export default function NewDataSourceContent({
  connections,
  existingDataSources,
  selectedConnectionId,
  selectedSchema,
  schemas,
  tables,
  selectedTables,
  connectionFilter,
  schemaFilter,
  tableFilter,
  loadingSchemas,
  loadingTables,
  adding,
  error,
  setConnectionFilter,
  setSchemaFilter,
  setTableFilter,
  selectConnection,
  selectSchema,
  toggleTable,
  selectAllTables,
  addDataSources,
  onClose,
}: NewDataSourceContentProps) {
  const selectedConnection = useMemo(
    () => connections.find((c) => c.id === selectedConnectionId),
    [connections, selectedConnectionId]
  );

  const availableTables = useMemo(() => {
    if (!selectedConnectionId) return [];
    return tables.filter((table) => {
      if (tableFilter && !table.toLowerCase().includes(tableFilter.toLowerCase())) return false;
      return !existingDataSources.some(
        (ds) =>
          ds.connectionId === selectedConnectionId &&
          ds.tableName === table &&
          (ds.schemaName || null) === (selectedSchema || null)
      );
    });
  }, [existingDataSources, selectedConnectionId, selectedSchema, tableFilter, tables]);

  const allTablesSelected = useMemo(() => {
    if (availableTables.length === 0) return false;
    return availableTables.every((table) => selectedTables.has(table));
  }, [availableTables, selectedTables]);

  return (
    <PageContainer flex innerClassName="lg:flex-1 flex flex-col lg:min-h-0">
      <PageHeader
        title={<PageTitle>New Data Source</PageTitle>}
        action={
          <IconButton
            onClick={onClose}
            variant="danger"
            icon={<CloseIcon className="w-4 h-4" />}
            tooltip="Close"
          />
        }
      />
      {error && <ErrorMessage message={error} className="mb-4" />}
      <DataSourcesGrid>
        <DataSourcesPanel title="Database Connections">
          {connections.length === 0 ? (
            <InfoMessage message="No connections available. Create a connection first." />
          ) : (
            <>
              <Input
                type="text"
                placeholder="Filter connections..."
                value={connectionFilter}
                onChange={(e) => setConnectionFilter(e.target.value)}
                className="mb-3"
              />
              <div className="space-y-2 flex-1 overflow-y-auto lg:min-h-0">
                {connections
                  .filter(
                    (connection) =>
                      connection.name.toLowerCase().includes(connectionFilter.toLowerCase()) ||
                      connection.database.toLowerCase().includes(connectionFilter.toLowerCase()) ||
                      connection.type.toLowerCase().includes(connectionFilter.toLowerCase())
                  )
                  .map((connection) => (
                    <button
                      key={connection.id}
                      onClick={() => selectConnection(connection.id)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        selectedConnectionId === connection.id
                          ? 'border-[var(--color-accent)] bg-[var(--color-surface-muted)]'
                          : 'border-[var(--color-border)] hover:border-[var(--color-border-muted)]'
                      }`}
                    >
                      <div className="font-medium text-[var(--color-foreground)]">
                        {connection.name}
                      </div>
                      <div className="text-sm text-[var(--color-muted-foreground)]">
                        {connection.type === 'postgresql' ? 'PostgreSQL' : 'ClickHouse'} •{' '}
                        {connection.database}
                      </div>
                    </button>
                  ))}
              </div>
            </>
          )}
        </DataSourcesPanel>

        <DataSourcesPanel title={selectedConnection?.type === 'clickhouse' ? 'Tables' : 'Schemas'}>
          {!selectedConnectionId ? (
            <InfoMessage message="Select a connection first" />
          ) : loadingSchemas ? (
            <InfoMessage message="Loading..." />
          ) : selectedConnection?.type === 'clickhouse' ? (
            <InfoMessage message="ClickHouse doesn't use schemas. Tables are shown on the right." />
          ) : schemas.length === 0 ? (
            <InfoMessage message="No schemas found" />
          ) : (
            <>
              <Input
                type="text"
                placeholder="Filter schemas..."
                value={schemaFilter}
                onChange={(e) => setSchemaFilter(e.target.value)}
                className="mb-3"
              />
              <div className="space-y-2 flex-1 overflow-y-auto lg:min-h-0">
                {schemas
                  .filter((schema) => schema.toLowerCase().includes(schemaFilter.toLowerCase()))
                  .map((schema) => (
                    <button
                      key={schema}
                      onClick={() => selectSchema(schema)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        selectedSchema === schema
                          ? 'border-[var(--color-accent)] bg-[var(--color-surface-muted)]'
                          : 'border-[var(--color-border)] hover:border-[var(--color-border-muted)]'
                      }`}
                    >
                      <div className="font-medium text-[var(--color-foreground)]">{schema}</div>
                    </button>
                  ))}
              </div>
            </>
          )}
        </DataSourcesPanel>

        <DataSourcesPanel title="Tables/Data Sources">
          {!selectedConnectionId ? (
            <InfoMessage message="Select a connection first" />
          ) : selectedConnection?.type === 'postgresql' && !selectedSchema ? (
            <InfoMessage message="Select a schema first" />
          ) : loadingTables ? (
            <InfoMessage message="Loading..." />
          ) : tables.length === 0 ? (
            <InfoMessage message="No tables found" />
          ) : (
            <div className="space-y-2 flex-1 overflow-y-auto lg:min-h-0 relative">
              <Input
                type="text"
                placeholder="Filter tables..."
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                className="mb-3"
              />
              <div className="mb-2">
                <button
                  onClick={selectAllTables}
                  className="text-sm text-[var(--color-accent)] hover:opacity-80 font-medium"
                >
                  {allTablesSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              {tables
                .filter((table) => table.toLowerCase().includes(tableFilter.toLowerCase()))
                .map((table) => {
                  const existingDataSource = existingDataSources.find(
                    (ds) =>
                      ds.connectionId === selectedConnectionId &&
                      ds.tableName === table &&
                      (ds.schemaName || null) === (selectedSchema || null)
                  );
                  const isExisting = !!existingDataSource;
                  const isSelected = selectedTables.has(table);

                  return (
                    <div
                      key={table}
                      className={`flex items-center p-3 rounded-md border transition-colors ${
                        isSelected
                          ? 'border-[var(--color-accent)] bg-[var(--color-surface-muted)]'
                          : 'border-[var(--color-border)]'
                      } ${isExisting ? 'opacity-75' : ''}`}
                    >
                      <label className="flex items-center flex-1 cursor-pointer">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleTable(table)}
                          disabled={isExisting}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-[var(--color-foreground)]">{table}</div>
                          {isExisting && (
                            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                              ✓ Already added as data source
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              {selectedTables.size > 0 && (
                <div className="sticky bottom-0 pt-4 pb-2 bg-[var(--color-surface)]">
                  <Button onClick={addDataSources} disabled={adding} className="w-full">
                    {adding
                      ? 'Adding...'
                      : `Add ${selectedTables.size} Data Source${
                          selectedTables.size > 1 ? 's' : ''
                        }`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DataSourcesPanel>
      </DataSourcesGrid>
    </PageContainer>
  );
}

