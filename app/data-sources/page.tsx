'use client';

import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import AuthGuard from '@/components/common/AuthGuard';
import DataSourcesHeader from '@/components/data-sources/DataSourcesHeader';
import DataSourcesContent from '@/components/data-sources/DataSourcesContent';
import { useDataSourcesPage } from '@/hooks/useDataSourcesPage';

export default function DataSourcesPage() {
  const router = useRouter();
  const page = useDataSourcesPage();

  return (
    <AuthGuard requiredRole="metadata_editor" loading={page.loading}>
      <PageContainer flex innerClassName="h-full flex flex-col min-h-0">
        <DataSourcesHeader />
        <DataSourcesContent
          dataSources={page.dataSources}
          filteredDataSources={page.filteredDataSources}
          filterText={page.filterText}
          tags={page.tags}
          tagsLoading={page.tagsLoading}
          filterTagIds={page.filterTagIds}
          onFilterTagToggle={page.toggleFilterTag}
          filterUnusedOnly={page.filterUnusedOnly}
          onFilterUnusedOnlyChange={page.setFilterUnusedOnly}
          error={page.error}
          onFilterChange={page.setFilterText}
          onEdit={page.onEdit}
          onDelete={page.remove}
          dataSetCountBySourceId={page.dataSetCountBySourceId}
          onCreateNew={() => router.push('/data-sources/new')}
        />
      </PageContainer>
    </AuthGuard>
  );
}
