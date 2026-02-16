'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import ErrorMessage from '@/components/ErrorMessage';
import PageContainer from '@/components/PageContainer';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import InfoMessage from '@/components/ui/InfoMessage';
import Badge from '@/components/ui/Badge';
import { useDataSetSelection } from '@/hooks/useDataSetSelection';
import { useDataSets } from '@/hooks/useDataSets';
import { useTags } from '@/hooks/useTags';
import DataSetSelectionPanel from '@/components/data-sets/DataSetSelectionPanel';
import TagFilter from '@/components/common/TagFilter';
import { DataSource } from '@/types/data-source';
import { isResolutionTagName } from '@/lib/data-set-tags';

export default function NewDataSetPage() {
  const router = useRouter();
  const { status, data } = useRequireAuthRedirect();
  const roles = data?.user?.roles ?? [];
  const canViewMetadata = roles.includes('metadata_editor');
  const {
    dataSources,
    dataSourcesFilteredByTags,
    selectedDataSources,
    dataSourceFilter,
    filterTagIds,
    toggleFilterTag,
    loading,
    error,
    setDataSourceFilter,
    toggleDataSource,
    selectAllDataSources,
    next,
  } = useDataSetSelection({ sourcesOnly: true });
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

  const dataSetTagsFromSources = useMemo(() => {
    const ids = new Set<string>();
    dataSources.forEach((ds) => {
      if (selectedDataSources.has(ds.id) && ds.tagIds) {
        ds.tagIds.forEach((id) => ids.add(id));
      }
    });
    return Array.from(ids).filter(
      (id) => !isResolutionTagName(tags.find((t) => t.id === id)?.name ?? '')
    );
  }, [dataSources, selectedDataSources, tags]);
  const dataSetTagNames = useMemo(
    () => dataSetTagsFromSources.map((id) => tags.find((t) => t.id === id)?.name ?? id),
    [dataSetTagsFromSources, tags]
  );

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
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Create New Data Set</PageTitle>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/data-sets')} variant="secondary">
            Back
          </Button>
          <Button onClick={next} disabled={!hasSelection}>
            Next
          </Button>
        </div>
      </div>
      {error && <ErrorMessage message={error} className="mb-4" />}
      {hasSelection && dataSetTagNames.length > 0 && (
        <div className="mb-4">
          <span className="text-sm font-medium text-[var(--color-foreground)] mr-2">
            Теги дата-сета (по выбранным источникам):
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {dataSetTagNames.map((name, i) => (
              <Badge key={dataSetTagsFromSources[i]} variant="info">
                {name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <div className="mb-6">
        {tags.length > 0 && (
          <div className="mb-4">
            <TagFilter
              tags={tags}
              loading={tagsLoading}
              selectedTagIds={filterTagIds}
              onToggleTag={toggleFilterTag}
            />
          </div>
        )}
        <DataSetSelectionPanel
          title="Data Sources"
          items={dataSourcesFilteredByTags}
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
          getBadge={(ds: DataSource) => {
            const count = dataSetCountBySourceId[ds.id] ?? 0;
            return count > 0 ? (
              <Badge variant="info" className="shrink-0 ml-2">
                {count} data set{count !== 1 ? 's' : ''}
              </Badge>
            ) : null;
          }}
        />
      </div>
    </PageContainer>
  );
}

