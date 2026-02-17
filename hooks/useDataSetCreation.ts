import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { DataSource } from '@/types/data-source';
import type { DataSetType, TimeUnit, AggregationFunction, PreaggregationConfig } from '@/types/data-set';
import { useTags } from '@/hooks/useTags';
import { parsePreaggregationFromTableName } from '@/lib/preaggregation';
import { isResolutionTagName } from '@/lib/data-set-tags';

export interface UseDataSetCreationReturn {
  dataSources: DataSource[];
  selectedDataSources: Set<string>;
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
  tagIds: string[];
  addTag: (tagId: string) => void;
  removeTag: (tagId: string) => void;
  createDataSet: () => Promise<void>;
  selectedSourcesList: DataSource[];
  totalSelected: number;
  showTypeSelection: boolean;
  showAggregationSection: boolean;
}

export function useDataSetCreation(options?: { enabled?: boolean }): UseDataSetCreationReturn {
  const enabled = options?.enabled ?? true;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedDataSources, setSelectedDataSources] = useState<Set<string>>(new Set());
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
  const hasInitializedTagsFromSources = useRef(false);
  const hasInitializedDescriptionFromSource = useRef(false);
  const { tags: allTags } = useTags();

  const loadData = useCallback(async () => {
    try {
      const sourcesRes = await fetch('/api/data-sources', { credentials: 'include' });
      if (!sourcesRes.ok) throw new Error('Failed to fetch data sources');
      const sourcesData = await sourcesRes.json();
      setDataSources(sourcesData);
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
    if (sourcesParam) {
      setSelectedDataSources(new Set(sourcesParam.split(',').filter(Boolean)));
    }
  }, [searchParams]);

  useEffect(() => {
    if (hasInitializedTagsFromSources.current || selectedDataSources.size === 0 || allTags.length === 0) return;
    const ids = new Set<string>();
    const collect = (id: string) => {
      const name = allTags.find((t) => t.id === id)?.name ?? '';
      if (!isResolutionTagName(name)) ids.add(id);
    };
    dataSources.filter((ds) => selectedDataSources.has(ds.id)).forEach((ds) => (ds.tagIds || []).forEach(collect));
    if (ids.size > 0) {
      setTagIds(Array.from(ids));
      hasInitializedTagsFromSources.current = true;
    }
  }, [dataSources, selectedDataSources, allTags]);

  const selectedSourcesList = dataSources.filter((ds) => selectedDataSources.has(ds.id));

  useEffect(() => {
    if (
      hasInitializedDescriptionFromSource.current ||
      selectedSourcesList.length === 0 ||
      description.trim() !== ''
    )
      return;
    hasInitializedDescriptionFromSource.current = true;
    const firstSourceDesc = selectedSourcesList[0]?.description?.trim();
    if (firstSourceDesc) setDescription(firstSourceDesc);
  }, [selectedSourcesList, description]);

  useEffect(() => {
    if (dataSetType === 'preaggregated' && selectedDataSources.size > 0) {
      setPreaggregationConfigState((prev) => {
        const next = new Map(prev);
        selectedDataSources.forEach((dataSourceId) => {
          if (!next.has(dataSourceId)) {
            const ds = dataSources.find((d) => d.id === dataSourceId);
            const parsed = parsePreaggregationFromTableName(ds?.tableName ?? '');
            next.set(dataSourceId, {
              dataSourceId,
              interval: parsed?.interval ?? 1,
              timeUnit: parsed?.timeUnit ?? 'seconds',
            });
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
  }, [dataSetType, selectedDataSources, dataSources]);

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
    const totalSelected = selectedSources.length;
    if (totalSelected === 0) {
      setError('At least one data source or data set must be selected');
      return;
    }

    const finalType: DataSetType | undefined = totalSelected > 1 ? dataSetType : undefined;

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
          dataSetIds: [],
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
    tagIds,
    dataSetType,
    preaggregationConfig,
    useAggregation,
    aggregationFunction,
    aggregationInterval,
    aggregationTimeUnit,
    router,
  ]);

  const totalSelected = selectedDataSources.size;
  const showTypeSelection = totalSelected > 1;
  const showAggregationSection = totalSelected >= 1 && (totalSelected === 1 || dataSetType === 'combined');

  return {
    dataSources,
    selectedDataSources,
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
    tagIds,
    addTag,
    removeTag,
    createDataSet,
    selectedSourcesList,
    totalSelected,
    showTypeSelection,
    showAggregationSection,
  };
}
