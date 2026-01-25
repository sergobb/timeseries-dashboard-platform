'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import ErrorMessage from '@/components/ErrorMessage';
import InfoMessage from '@/components/ui/InfoMessage';
import { useDataSourceCreation } from '@/hooks/useDataSourceCreation';
import NewDataSourceContent from '@/components/data-sources/NewDataSourceContent';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';

export default function NewDataSourcePage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <InfoMessage message="Loading..." size="base" />
        </PageContainer>
      }
    >
      <NewDataSourcePageInner />
    </Suspense>
  );
}

function NewDataSourcePageInner() {
  const router = useRouter();
  const { status, data } = useRequireAuthRedirect();
  const roles = data?.user?.roles ?? [];
  const canViewMetadata = roles.includes('metadata_editor');
  const {
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
    loading,
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
  } = useDataSourceCreation();

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

  if (!canViewMetadata) {
    return (
      <PageContainer>
        <ErrorMessage message="Недостаточно прав. Требуется роль: metadata_editor." />
      </PageContainer>
    );
  }

  return (
    <NewDataSourceContent
      connections={connections}
      existingDataSources={existingDataSources}
      selectedConnectionId={selectedConnectionId}
      selectedSchema={selectedSchema}
      schemas={schemas}
      tables={tables}
      selectedTables={selectedTables}
      connectionFilter={connectionFilter}
      schemaFilter={schemaFilter}
      tableFilter={tableFilter}
      loadingSchemas={loadingSchemas}
      loadingTables={loadingTables}
      adding={adding}
      error={error}
      setConnectionFilter={setConnectionFilter}
      setSchemaFilter={setSchemaFilter}
      setTableFilter={setTableFilter}
      selectConnection={selectConnection}
      selectSchema={selectSchema}
      toggleTable={toggleTable}
      selectAllTables={selectAllTables}
      addDataSources={addDataSources}
      onClose={() => router.push('/data-sources')}
    />
  );
}
