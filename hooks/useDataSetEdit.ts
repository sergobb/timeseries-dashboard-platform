import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DataSet, DataSetType, PreaggregationConfig, AggregationFunction, TimeUnit } from '@/types/data-set';
import { DataSource } from '@/types/data-source';
import { parsePreaggregationFromTableName } from '@/lib/preaggregation';

interface UseDataSetEditReturn {
  dataSet: DataSet | null;
  dataSources: DataSource[];
  selectedDataSources: Set<string>;
  selectedSourcesList: DataSource[];
  availableDataSources: DataSource[];
  totalSelected: number;
  showTypeSelection: boolean;
  showAggregationSection: boolean;
  tagIds: string[];
  description: string;
  dataSetType: DataSetType;
  preaggregationConfig: Map<string, PreaggregationConfig>;
  useAggregation: boolean;
  aggregationFunction: AggregationFunction;
  aggregationInterval: number;
  aggregationTimeUnit: TimeUnit;
  loading: boolean;
  saving: boolean;
  error: string | null;
  setDescription: (value: string) => void;
  setDataSetType: (type: DataSetType) => void;
  setUseAggregation: (value: boolean) => void;
  setAggregationFunction: (value: AggregationFunction) => void;
  setAggregationInterval: (value: number) => void;
  setAggregationTimeUnit: (value: TimeUnit) => void;
  addDataSource: (id: string) => void;
  removeDataSource: (id: string) => void;
  updatePreaggregationConfig: (dataSourceId: string, config: PreaggregationConfig) => void;
  addTag: (tagId: string) => void;
  removeTag: (tagId: string) => void;
  save: () => Promise<void>;
}

export function useDataSetEdit(dataSetId: string): UseDataSetEditReturn {
  const router = useRouter();
  const [dataSet, setDataSet] = useState<DataSet | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedDataSources, setSelectedDataSources] = useState<Set<string>>(new Set());
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [dataSetType, setDataSetType] = useState<DataSetType>('combined');
  const [preaggregationConfig, setPreaggregationConfig] = useState<Map<string, PreaggregationConfig>>(new Map());
  const [useAggregation, setUseAggregation] = useState(false);
  const [aggregationFunction, setAggregationFunction] = useState<AggregationFunction>('none');
  const [aggregationInterval, setAggregationInterval] = useState(1);
  const [aggregationTimeUnit, setAggregationTimeUnit] = useState<TimeUnit>('seconds');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      
      const [sourcesResponse, dataSetResponse] = await Promise.all([
        fetch('/api/data-sources', { credentials: 'include' }),
        fetch(`/api/data-sets/${dataSetId}`, { credentials: 'include' }),
      ]);

      if (!sourcesResponse.ok) throw new Error('Failed to fetch data sources');
      const sourcesData = await sourcesResponse.json();
      setDataSources(sourcesData);

      if (dataSetResponse.ok) {
        const dataSetData = await dataSetResponse.json();
        setDataSet(dataSetData);
        setDescription(dataSetData.description || '');
        setTagIds(dataSetData.tagIds || []);
        setDataSetType(dataSetData.type || 'combined');
        const dataSourceIds = Array.isArray(dataSetData.dataSourceIds)
          ? dataSetData.dataSourceIds.filter((id: unknown): id is string => typeof id === 'string')
          : [];
        setSelectedDataSources(new Set<string>(dataSourceIds));
        
        if (dataSetData.preaggregationConfig?.length) {
          const configMap = new Map<string, PreaggregationConfig>();
          dataSetData.preaggregationConfig.forEach((config: PreaggregationConfig) => {
            configMap.set(config.dataSourceId, {
              dataSourceId: config.dataSourceId,
              interval: config.interval || 1,
              timeUnit: config.timeUnit || 'seconds',
            });
          });
          setPreaggregationConfig(configMap);
        }
        setUseAggregation(Boolean(dataSetData.useAggregation));
        if (dataSetData.aggregationFunction) {
          setAggregationFunction(dataSetData.aggregationFunction);
        }
        setAggregationInterval(dataSetData.aggregationInterval ?? 1);
        if (dataSetData.aggregationTimeUnit) {
          setAggregationTimeUnit(dataSetData.aggregationTimeUnit);
        }
      } else if (dataSetResponse.status === 404) {
        setError('Data set not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [dataSetId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (dataSetType === 'preaggregated' && selectedDataSources.size > 0) {
      const newConfig = new Map(preaggregationConfig);
      selectedDataSources.forEach(dataSourceId => {
        if (!newConfig.has(dataSourceId)) {
          const ds = dataSources.find(d => d.id === dataSourceId);
          const tableName = ds?.tableName ?? '';
          const parsed = parsePreaggregationFromTableName(tableName);
          newConfig.set(dataSourceId, {
            dataSourceId,
            interval: parsed?.interval ?? 1,
            timeUnit: parsed?.timeUnit ?? 'seconds',
          });
        }
      });
      Array.from(newConfig.keys()).forEach(id => {
        if (!selectedDataSources.has(id)) {
          newConfig.delete(id);
        }
      });
      setPreaggregationConfig(newConfig);
    } else if (dataSetType !== 'preaggregated') {
      setPreaggregationConfig(new Map());
    }
  }, [dataSetType, selectedDataSources, dataSources]);

  const addDataSource = useCallback((id: string) => {
    setSelectedDataSources(prev => new Set(prev).add(id));
  }, []);

  const removeDataSource = useCallback((id: string) => {
    setSelectedDataSources(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const addTag = useCallback((tagId: string) => {
    setTagIds((prev) => (prev.includes(tagId) ? prev : [...prev, tagId]));
  }, []);

  const removeTag = useCallback((tagId: string) => {
    setTagIds((prev) => prev.filter((id) => id !== tagId));
  }, []);

  const updatePreaggregationConfig = useCallback((dataSourceId: string, config: PreaggregationConfig) => {
    setPreaggregationConfig(prev => {
      const newConfig = new Map(prev);
      newConfig.set(dataSourceId, config);
      return newConfig;
    });
  }, []);

  const save = useCallback(async () => {
    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    const selectedSources = Array.from(selectedDataSources);
    const totalSelected = selectedSources.length;

    if (totalSelected === 0) {
      setError('At least one data source must be selected');
      return;
    }

    const finalType: DataSetType | undefined = totalSelected > 1 ? dataSetType : undefined;

    const preaggConfig = finalType === 'preaggregated' 
      ? Array.from(preaggregationConfig.values())
      : [];

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/data-sets/${dataSetId}`, {
        method: 'PUT',
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
          tagIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update data set');
      }

      router.push('/data-sets');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update data set');
    } finally {
      setSaving(false);
    }
  }, [dataSetId, description, selectedDataSources, tagIds, dataSetType, preaggregationConfig, useAggregation, aggregationFunction, aggregationInterval, aggregationTimeUnit, router]);

  const selectedSourcesList = useMemo(
    () => dataSources.filter((ds) => selectedDataSources.has(ds.id)),
    [dataSources, selectedDataSources]
  );
  const availableDataSources = useMemo(
    () => dataSources.filter((ds) => !selectedDataSources.has(ds.id)),
    [dataSources, selectedDataSources]
  );
  const totalSelected = selectedDataSources.size;
  const showTypeSelection = totalSelected > 1;
  const showAggregationSection =
    totalSelected >= 1 && (totalSelected === 1 || dataSetType === 'combined');

  return {
    dataSet,
    dataSources,
    selectedDataSources,
    selectedSourcesList,
    availableDataSources,
    totalSelected,
    showTypeSelection,
    showAggregationSection,
    tagIds,
    description,
    dataSetType,
    preaggregationConfig,
    useAggregation,
    aggregationFunction,
    aggregationInterval,
    aggregationTimeUnit,
    loading,
    saving,
    error,
    setDescription,
    setDataSetType,
    setUseAggregation,
    setAggregationFunction,
    setAggregationInterval,
    setAggregationTimeUnit,
    addDataSource,
    removeDataSource,
    updatePreaggregationConfig,
    addTag,
    removeTag,
    save,
  };
}
