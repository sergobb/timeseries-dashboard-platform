import { useMemo, useState } from 'react';
import { useDataSources } from '@/hooks/useDataSources';
import { useDataSets } from '@/hooks/useDataSets';
import { useTags } from '@/hooks/useTags';

export function useDataSourcesPage() {
  const sources = useDataSources();
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

  return {
    ...sources,
    tags,
    tagsLoading,
    filterUnusedOnly,
    setFilterUnusedOnly,
    dataSetCountBySourceId,
  };
}
