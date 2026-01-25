'use client';

import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import { useDataSets } from '@/hooks/useDataSets';
import PageContainer from '@/components/PageContainer';
import ErrorMessage from '@/components/ErrorMessage';
import InfoMessage from '@/components/ui/InfoMessage';
import DataSetsHeader from '@/components/data-sets/DataSetsHeader';
import DataSetsContent from '@/components/data-sets/DataSetsContent';

export default function DataSetsPage() {
  const { status, data } = useRequireAuthRedirect();
  const roles = data?.user?.roles ?? [];
  const canViewMetadata = roles.includes('metadata_editor');
  const {
    dataSets,
    loading,
    error,
    filterText,
    setFilterText,
    filteredDataSets,
    remove,
  } = useDataSets();

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
      <DataSetsHeader />
      <DataSetsContent
        dataSets={dataSets}
        filteredDataSets={filteredDataSets}
        filterText={filterText}
        error={error}
        onFilterChange={setFilterText}
        onDelete={remove}
      />
    </PageContainer>
  );
}

