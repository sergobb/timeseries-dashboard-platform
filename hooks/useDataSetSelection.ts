import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DataSource } from '@/types/data-source';
import { DataSet } from '@/types/data-set';

interface UseDataSetSelectionOptions {
  /** Only allow selecting data sources (no Data Sets panel). Skips fetching data sets. */
  sourcesOnly?: boolean;
}

interface UseDataSetSelectionReturn {
  dataSources: DataSource[];
  dataSets: DataSet[];
  selectedDataSources: Set<string>;
  selectedDataSets: Set<string>;
  dataSourceFilter: string;
  dataSetFilter: string;
  loading: boolean;
  error: string | null;
  setDataSourceFilter: (value: string) => void;
  setDataSetFilter: (value: string) => void;
  toggleDataSource: (id: string) => void;
  toggleDataSet: (id: string) => void;
  selectAllDataSources: () => void;
  selectAllDataSets: () => void;
  next: () => void;
}

export function useDataSetSelection(options: UseDataSetSelectionOptions = {}): UseDataSetSelectionReturn {
  const { sourcesOnly = false } = options;
  const router = useRouter();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [selectedDataSources, setSelectedDataSources] = useState<Set<string>>(new Set());
  const [selectedDataSets, setSelectedDataSets] = useState<Set<string>>(new Set());
  const [dataSourceFilter, setDataSourceFilter] = useState('');
  const [dataSetFilter, setDataSetFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const sourcesResponse = await fetch('/api/data-sources', { credentials: 'include' });
      if (!sourcesResponse.ok) throw new Error('Failed to fetch data sources');
      const sourcesData = await sourcesResponse.json();
      setDataSources(sourcesData);

      if (!sourcesOnly) {
        const setsResponse = await fetch('/api/data-sets', { credentials: 'include' });
        if (setsResponse.ok) {
          const setsData = await setsResponse.json();
          setDataSets(setsData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [sourcesOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleDataSource = useCallback((id: string) => {
    setSelectedDataSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        setSelectedDataSets(new Set());
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleDataSet = useCallback((id: string) => {
    setSelectedDataSets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        setSelectedDataSources(new Set());
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAllDataSources = useCallback(() => {
    const filtered = dataSources.filter(ds => {
      const displayName = ds.schemaName 
        ? `${ds.schemaName}.${ds.tableName}` 
        : ds.tableName;
      return displayName.toLowerCase().includes(dataSourceFilter.toLowerCase()) ||
             (ds.description && ds.description.toLowerCase().includes(dataSourceFilter.toLowerCase()));
    });

    const allSelected = filtered.length > 0 && 
      filtered.every(ds => selectedDataSources.has(ds.id));

    if (allSelected) {
      setSelectedDataSources(prev => {
        const newSet = new Set(prev);
        filtered.forEach(ds => newSet.delete(ds.id));
        return newSet;
      });
    } else {
      setSelectedDataSets(new Set());
      setSelectedDataSources(prev => {
        const newSet = new Set(prev);
        filtered.forEach(ds => newSet.add(ds.id));
        return newSet;
      });
    }
  }, [dataSources, dataSourceFilter, selectedDataSources]);

  const selectAllDataSets = useCallback(() => {
    const filtered = dataSets.filter(ds => 
      ds.description && ds.description.toLowerCase().includes(dataSetFilter.toLowerCase())
    );

    const allSelected = filtered.length > 0 && 
      filtered.every(ds => selectedDataSets.has(ds.id));

    if (allSelected) {
      setSelectedDataSets(prev => {
        const newSet = new Set(prev);
        filtered.forEach(ds => newSet.delete(ds.id));
        return newSet;
      });
    } else {
      setSelectedDataSources(new Set());
      setSelectedDataSets(prev => {
        const newSet = new Set(prev);
        filtered.forEach(ds => newSet.add(ds.id));
        return newSet;
      });
    }
  }, [dataSets, dataSetFilter, selectedDataSets]);

  const next = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedDataSources.size > 0) {
      params.set('sources', Array.from(selectedDataSources).join(','));
    }
    if (selectedDataSets.size > 0) {
      params.set('sets', Array.from(selectedDataSets).join(','));
    }
    router.push(`/data-sets/new/edit?${params.toString()}`);
  }, [selectedDataSources, selectedDataSets, router]);

  return {
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
  };
}
