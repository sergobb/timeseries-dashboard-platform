import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { DataSource } from '@/types/data-source';
import type { DataSet } from '@/types/data-set';
import type { DataSetType, TimeUnit, AggregationFunction, PreaggregationConfig } from '@/types/data-set';

export interface UseDataSetCreationReturn {
  dataSources: DataSource[];
  dataSets: DataSet[];
  selectedDataSources: Set<string>;
  selectedDataSets: Set<string>;
  loading: boolean;
  error: string;
  description: string;
  dataSetType: DataSetType;
  creating: boolean;
  preaggregationConfig: Map<string, { dataSourceId: string; interval: number; timeUnit: TimeUnit }>;
  useAggregation: boolean;
  aggregationFunction: AggregationFunction;
  aggregationInterval: number;
  aggregationTimeUnit: TimeUnit;
  setDescription: (v: string) => void;
  setError: (v: string) => void;
  setDataSetType: (v: DataSetType) => void;
  setUseAggregation: (v: boolean) => void;
  setAggregationFunction: (v: AggregationFunction) => void;
  setAggregationInterval: (v: number) => void;
  setAggregationTimeUnit: (v: TimeUnit) => void;
  updatePreaggregation: (dataSourceId: string, updates: { interval?: number; timeUnit?: TimeUnit }) => void;
  removeDataSource: (id: string) => void;
  removeDataSet: (id: string) => void;
  tagIds: string[];
  addTag: (tagId: string) => void;
  removeTag: (tagId: string) => void;
  createDataSet: () => Promise<void>;
  selectedSourcesList: DataSource[];
  selectedSetsList: DataSet[];
  totalSelected: number;
  showTypeSelection: boolean;
  showAggregationSection: boolean;
}

export function useDataSetCreation(options?: { enabled?: boolean }): UseDataSetCreationReturn {
  const enabled = options?.enabled ?? true;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [selectedDataSources, setSelectedDataSources] = useState<Set<string>>(new Set());
  const [selectedDataSets, setSelectedDataSets] = useState<Set<string>>(new Set());
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [dataSetType, setDataSetType] = useState<DataSetType>('combined');
  const [creating, setCreating] = useState(false);
  const [preaggregationConfig, setPreaggregationConfigState] = useState<
    Map<string, { dataSourceId: string; interval: number; timeUnit: TimeUnit }>
  >(new Map());
  const [useAggregation, setUseAggregation] = useState(false);
  const [aggregationFunction, setAggregationFunction] = useState<AggregationFunction>('none');
  const [aggregationInterval, setAggregationInterval] = useState(1);
  const [aggregationTimeUnit, setAggregationTimeUnit] = useState<TimeUnit>('seconds');

  const loadData = useCallback(async () => {
    try {
      const [sourcesRes, setsRes] = await Promise.all([
        fetch('/api/data-sources', { credentials: 'include' }),
        fetch('/api/data-sets', { credentials: 'include' }),
      ]);
      if (!sourcesRes.ok) throw new Error('Failed to fetch data sources');
      const sourcesData = await sourcesRes.json();
      setDataSources(sourcesData);
      if (setsRes.ok) {
        const setsData = await setsRes.json();
        setDataSets(setsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) loadData();
  }, [enabled, loadData]);

  useEffect(() => {
    const sourcesParam = searchParams.get('sources');
    const setsParam = searchParams.get('sets');
    if (sourcesParam) {
      setSelectedDataSources(new Set(sourcesParam.split(',').filter(Boolean)));
    }
    if (setsParam) {
      setSelectedDataSets(new Set(setsParam.split(',').filter(Boolean)));
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedDataSets.size > 0) setDataSetType('combined');
  }, [selectedDataSets.size]);

  useEffect(() => {
    if (dataSetType === 'preaggregated' && selectedDataSources.size > 0) {
      setPreaggregationConfigState((prev) => {
        const next = new Map(prev);
        selectedDataSources.forEach((dataSourceId) => {
          if (!next.has(dataSourceId)) {
            next.set(dataSourceId, { dataSourceId, interval: 1, timeUnit: 'seconds' });
          }
        });
        Array.from(next.keys()).forEach((id) => {
          if (!selectedDataSources.has(id)) next.delete(id);
        });
        return next;
      });
    } else if (dataSetType !== 'preaggregated') {
      setPreaggregationConfigState(new Map());
    }
  }, [dataSetType, selectedDataSources]);

  const removeDataSource = useCallback((dataSourceId: string) => {
    setSelectedDataSources((prev) => {
      const next = new Set(prev);
      next.delete(dataSourceId);
      return next;
    });
  }, []);

  const addTag = useCallback((tagId: string) => {
    setTagIds((prev) => (prev.includes(tagId) ? prev : [...prev, tagId]));
  }, []);

  const removeTag = useCallback((tagId: string) => {
    setTagIds((prev) => prev.filter((id) => id !== tagId));
  }, []);

  const removeDataSet = useCallback((dataSetId: string) => {
    setSelectedDataSets((prev) => {
      const next = new Set(prev);
      next.delete(dataSetId);
      return next;
    });
  }, []);

  const updatePreaggregation = useCallback(
    (dataSourceId: string, updates: { interval?: number; timeUnit?: TimeUnit }) => {
      setPreaggregationConfigState((prev) => {
        const next = new Map(prev);
        const current = next.get(dataSourceId) ?? {
          dataSourceId,
          interval: 1,
          timeUnit: 'seconds' as TimeUnit,
        };
        next.set(dataSourceId, {
          ...current,
          ...(updates.interval !== undefined && { interval: updates.interval }),
          ...(updates.timeUnit !== undefined && { timeUnit: updates.timeUnit }),
        });
        return next;
      });
    },
    []
  );

  const createDataSet = useCallback(async () => {
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    const selectedSources = Array.from(selectedDataSources);
    const selectedSets = Array.from(selectedDataSets);
    const totalSelected = selectedSources.length + selectedSets.length;
    if (totalSelected === 0) {
      setError('At least one data source or data set must be selected');
      return;
    }

    let finalType: DataSetType | undefined;
    if (selectedSets.length > 0) finalType = 'combined';
    else if (totalSelected > 1) finalType = dataSetType;

    const preaggConfig: PreaggregationConfig[] =
      finalType === 'preaggregated' ? Array.from(preaggregationConfig.values()) : [];

    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/data-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          description: description.trim(),
          type: finalType,
          dataSourceIds: selectedSources,
          dataSetIds: selectedSets,
          preaggregationConfig: preaggConfig,
          useAggregation: useAggregation,
          aggregationFunction: aggregationFunction,
          aggregationInterval: aggregationInterval,
          aggregationTimeUnit: aggregationTimeUnit,
          tagIds: tagIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create data set');
      }
      router.push('/data-sets');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create data set');
    } finally {
      setCreating(false);
    }
  }, [
    description,
    selectedDataSources,
    selectedDataSets,
    tagIds,
    dataSetType,
    preaggregationConfig,
    useAggregation,
    aggregationFunction,
    aggregationInterval,
    aggregationTimeUnit,
    router,
  ]);

  const selectedSourcesList = dataSources.filter((ds) => selectedDataSources.has(ds.id));
  const selectedSetsList = dataSets.filter((ds) => selectedDataSets.has(ds.id));
  const totalSelected = selectedDataSources.size + selectedDataSets.size;
  const showTypeSelection = totalSelected > 1 && selectedDataSets.size === 0;
  const showAggregationSection = totalSelected >= 1 && (totalSelected === 1 || dataSetType === 'combined');

  return {
    dataSources,
    dataSets,
    selectedDataSources,
    selectedDataSets,
    loading,
    error,
    description,
    dataSetType,
    creating,
    preaggregationConfig,
    useAggregation,
    aggregationFunction,
    aggregationInterval,
    aggregationTimeUnit,
    setDescription,
    setError,
    setDataSetType,
    setUseAggregation,
    setAggregationFunction,
    setAggregationInterval,
    setAggregationTimeUnit,
    updatePreaggregation,
    removeDataSource,
    removeDataSet,
    tagIds,
    addTag,
    removeTag,
    createDataSet,
    selectedSourcesList,
    selectedSetsList,
    totalSelected,
    showTypeSelection,
    showAggregationSection,
  };
}
