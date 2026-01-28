'use client';

import { useRouter } from 'next/navigation';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import ErrorMessage from '@/components/ErrorMessage';
import PageContainer from '@/components/PageContainer';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import InfoMessage from '@/components/ui/InfoMessage';
import { useDataSetSelection } from '@/hooks/useDataSetSelection';
import DataSetSelectionPanel from '@/components/data-sets/DataSetSelectionPanel';
import { DataSource } from '@/types/data-source';

export default function NewDataSetPage() {
  const router = useRouter();
  const { status, data } = useRequireAuthRedirect();
  const roles = data?.user?.roles ?? [];
  const canViewMetadata = roles.includes('metadata_editor');
  const {
    dataSources,
    selectedDataSources,
    dataSourceFilter,
    loading,
    error,
    setDataSourceFilter,
    toggleDataSource,
    selectAllDataSources,
    next,
  } = useDataSetSelection({ sourcesOnly: true });

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
        <ErrorMessage message="Недостаточно прав. Требуется роль: metadata_editor." className="mb-4" />
        <Button onClick={() => router.push('/')} variant="secondary">
          На главную
        </Button>
      </PageContainer>
    );
  }

  const hasSelection = selectedDataSources.size > 0;

  return (
    <PageContainer className="min-h-screen" innerClassName="max-w-7xl mx-auto">
      <PageTitle className="mb-6">Create New Data Set</PageTitle>
      {error && <ErrorMessage message={error} className="mb-4" />}
      <div className="mb-6">
        <DataSetSelectionPanel
          title="Data Sources"
          items={dataSources}
          selectedIds={selectedDataSources}
          filter={dataSourceFilter}
          onFilterChange={setDataSourceFilter}
          onToggle={toggleDataSource}
          onSelectAll={selectAllDataSources}
          allSelected={false}
          disabled={false}
          getDisplayName={(ds: DataSource) =>
            ds.schemaName ? `${ds.schemaName}.${ds.tableName}` : ds.tableName
          }
          getDescription={(ds: DataSource) => ds.description}
        />
      </div>
      <div className="flex justify-between">
        <Button onClick={() => router.push('/data-sets')} variant="secondary">
          Back
        </Button>
        <Button onClick={next} disabled={!hasSelection}>
          Next
        </Button>
      </div>
    </PageContainer>
  );
}

