import { useMemo, useState } from 'react';
import { useDataSets } from '@/hooks/useDataSets';
import { useTags } from '@/hooks/useTags';
import { useDataSetSelection } from '@/hooks/useDataSetSelection';
import { isResolutionTagName } from '@/lib/data-set-tags';

export function useNewDataSetPage() {
  const { dataSets } = useDataSets();
  const { tags, loading: tagsLoading } = useTags();
  const [filterUnusedOnly, setFilterUnusedOnly] = useState(false);

  const dataSetCountBySourceId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const ds of dataSets) {
      for (const sourceId of ds.dataSourceIds || []) {
        map[sourceId] = (map[sourceId] ?? 0) + 1;
      }
    }
    return map;
  }, [dataSets]);

  const usedSourceIds = useMemo(
    () =>
      new Set(
        Object.entries(dataSetCountBySourceId)
          .filter(([, c]) => c > 0)
          .map(([id]) => id)
      ),
    [dataSetCountBySourceId]
  );

  const selection = useDataSetSelection({
    sourcesOnly: true,
    filterUnusedOnly,
    usedSourceIds,
  });

  const dataSetTagsFromSources = useMemo(() => {
    const ids = new Set<string>();
    selection.dataSources.forEach((ds) => {
      if (selection.selectedDataSources.has(ds.id) && ds.tagIds) {
        ds.tagIds.forEach((id) => ids.add(id));
      }
    });
    return Array.from(ids).filter(
      (id) => !isResolutionTagName(tags.find((t) => t.id === id)?.name ?? '')
    );
  }, [selection.dataSources, selection.selectedDataSources, tags]);

  const dataSetTagNames = useMemo(
    () =>
      dataSetTagsFromSources.map((id) => tags.find((t) => t.id === id)?.name ?? id),
    [dataSetTagsFromSources, tags]
  );

  const hasSelection = selection.selectedDataSources.size > 0;

  return {
    ...selection,
    tags,
    tagsLoading,
    filterUnusedOnly,
    setFilterUnusedOnly,
    dataSetCountBySourceId,
    dataSetTagsFromSources,
    dataSetTagNames,
    hasSelection,
  };
}
