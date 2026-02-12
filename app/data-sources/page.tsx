'use client';

import { useDataSources } from '@/hooks/useDataSources';
import PageContainer from '@/components/PageContainer';
import AuthGuard from '@/components/common/AuthGuard';
import DataSourcesHeader from '@/components/data-sources/DataSourcesHeader';
import DataSourcesContent from '@/components/data-sources/DataSourcesContent';

export default function DataSourcesPage() {
  const {
    dataSources,
    loading,
    error,
    filterText,
    setFilterText,
    filteredDataSources,
    remove,
    onEdit,
  } = useDataSources();

  return (
    <AuthGuard requiredRole="metadata_editor" loading={loading}>
      <PageContainer flex innerClassName="h-full flex flex-col min-h-0">
        <DataSourcesHeader />
        <DataSourcesContent
          dataSources={dataSources}
          filteredDataSources={filteredDataSources}
          filterText={filterText}
          error={error}
          onFilterChange={setFilterText}
          onEdit={onEdit}
          onDelete={remove}
        />
      </PageContainer>
    </AuthGuard>
  );
}
