'use client';

import { useMemo } from 'react';
import { useDataSources } from '@/hooks/useDataSources';
import { useDataSets } from '@/hooks/useDataSets';
import { useTags } from '@/hooks/useTags';
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
    filterTagIds,
    toggleFilterTag,
    filteredDataSources,
    remove,
    onEdit,
  } = useDataSources();
  const { dataSets } = useDataSets();
  const { tags, loading: tagsLoading } = useTags();

  const dataSetCountBySourceId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const ds of dataSets) {
      for (const sourceId of ds.dataSourceIds || []) {
        map[sourceId] = (map[sourceId] ?? 0) + 1;
      }
    }
    return map;
  }, [dataSets]);

  return (
    <AuthGuard requiredRole="metadata_editor" loading={loading}>
      <PageContainer flex innerClassName="h-full flex flex-col min-h-0">
        <DataSourcesHeader />
        <DataSourcesContent
          dataSources={dataSources}
          filteredDataSources={filteredDataSources}
          filterText={filterText}
          tags={tags}
          tagsLoading={tagsLoading}
          filterTagIds={filterTagIds}
          onFilterTagToggle={toggleFilterTag}
          error={error}
          onFilterChange={setFilterText}
          onEdit={onEdit}
          onDelete={remove}
          dataSetCountBySourceId={dataSetCountBySourceId}
        />
      </PageContainer>
    </AuthGuard>
  );
}
