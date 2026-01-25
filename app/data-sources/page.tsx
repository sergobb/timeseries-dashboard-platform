'use client';

import { useRouter } from 'next/navigation';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import { useDataSources } from '@/hooks/useDataSources';
import PageContainer from '@/components/PageContainer';
import ErrorMessage from '@/components/ErrorMessage';
import InfoMessage from '@/components/ui/InfoMessage';
import DataSourcesHeader from '@/components/data-sources/DataSourcesHeader';
import DataSourcesContent from '@/components/data-sources/DataSourcesContent';

export default function DataSourcesPage() {
  const router = useRouter();
  const { status, data } = useRequireAuthRedirect();
  const roles = data?.user?.roles ?? [];
  const canViewMetadata = roles.includes('metadata_editor');
  const {
    dataSources,
    loading,
    error,
    filterText,
    setFilterText,
    filteredDataSources,
    remove,
  } = useDataSources();

  if (status === 'loading' || loading) {
    return (
      <PageContainer>
        <InfoMessage message="Loading..." size="base" />
      </PageContainer>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (!canViewMetadata) {
    return (
      <PageContainer>
        <ErrorMessage message="Недостаточно прав. Требуется роль: metadata_editor." />
      </PageContainer>
    );
  }

  return (
    <PageContainer flex innerClassName="h-full flex flex-col min-h-0">
      <DataSourcesHeader />
      <DataSourcesContent
        dataSources={dataSources}
        filteredDataSources={filteredDataSources}
        filterText={filterText}
        error={error}
        onFilterChange={setFilterText}
        onEdit={(dataSourceId) => router.push(`/data-sources/${dataSourceId}/edit`)}
        onDelete={remove}
      />
    </PageContainer>
  );
}
