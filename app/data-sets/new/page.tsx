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
import { DataSet } from '@/types/data-set';

export default function NewDataSetPage() {
  const router = useRouter();
  const { status, data } = useRequireAuthRedirect();
  const roles = data?.user?.roles ?? [];
  const canViewMetadata = roles.includes('metadata_editor');
  const {
    dataSources,
    dataSets,
    selectedDataSources,
    selectedDataSets,
    dataSourceFilter,
    dataSetFilter,
    loading,
    error,
    setDataSourceFilter,
    setDataSetFilter,
    toggleDataSource,
    toggleDataSet,
    selectAllDataSources,
    selectAllDataSets,
    next,
  } = useDataSetSelection();

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

  const hasSelection = selectedDataSources.size > 0 || selectedDataSets.size > 0;
  const hasBothSelections = selectedDataSources.size > 0 && selectedDataSets.size > 0;

  return (
    <PageContainer flex innerClassName="lg:flex-1 flex flex-col lg:min-h-0">
      <PageTitle className="mb-6">Create New Data Set</PageTitle>
      {error && <ErrorMessage message={error} className="mb-4" />}
      {hasBothSelections && (
        <div className="mb-4 rounded-md bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          You cannot select both data sources and data sets at the same time. Please deselect one type.
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:flex-1 lg:min-h-0 mb-6">
        <DataSetSelectionPanel
          title="Data Sources"
          items={dataSources}
          selectedIds={selectedDataSources}
          filter={dataSourceFilter}
          onFilterChange={setDataSourceFilter}
          onToggle={toggleDataSource}
          onSelectAll={selectAllDataSources}
          allSelected={false}
          disabled={selectedDataSets.size > 0}
          getDisplayName={(ds: DataSource) => 
            ds.schemaName ? `${ds.schemaName}.${ds.tableName}` : ds.tableName
          }
          getDescription={(ds: DataSource) => ds.description}
        />
        <DataSetSelectionPanel
          title="Data Sets"
          items={dataSets}
          selectedIds={selectedDataSets}
          filter={dataSetFilter}
          onFilterChange={setDataSetFilter}
          onToggle={toggleDataSet}
          onSelectAll={selectAllDataSets}
          allSelected={false}
          disabled={selectedDataSources.size > 0}
          getDisplayName={(ds: DataSet) => ds.description || 'Data Set (no description)'}
          getDescription={() => undefined}
        />
      </div>
      <div className="flex justify-between">
        <Button onClick={() => router.push('/data-sets')} variant="secondary">
          Back
        </Button>
        <Button onClick={next} disabled={!hasSelection || hasBothSelections}>
          Next
        </Button>
      </div>
    </PageContainer>
  );
}

