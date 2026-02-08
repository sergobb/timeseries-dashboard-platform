import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DataSet, DataSetType, PreaggregationConfig, AggregationFunction, TimeUnit } from '@/types/data-set';
import { DataSource } from '@/types/data-source';

interface UseDataSetEditReturn {
  dataSet: DataSet | null;
  dataSources: DataSource[];
  dataSets: DataSet[];
  selectedDataSources: Set<string>;
  selectedDataSets: Set<string>;
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
  removeDataSource: (id: string) => void;
  removeDataSet: (id: string) => void;
  updatePreaggregationConfig: (dataSourceId: string, config: PreaggregationConfig) => void;
  save: () => Promise<void>;
}

export function useDataSetEdit(dataSetId: string): UseDataSetEditReturn {
  const router = useRouter();
  const [dataSet, setDataSet] = useState<DataSet | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [selectedDataSources, setSelectedDataSources] = useState<Set<string>>(new Set());
  const [selectedDataSets, setSelectedDataSets] = useState<Set<string>>(new Set());
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
      
      const [sourcesResponse, dataSetResponse, setsResponse] = await Promise.all([
        fetch('/api/data-sources', { credentials: 'include' }),
        fetch(`/api/data-sets/${dataSetId}`, { credentials: 'include' }),
        fetch('/api/data-sets', { credentials: 'include' }),
      ]);

      if (!sourcesResponse.ok) throw new Error('Failed to fetch data sources');
      const sourcesData = await sourcesResponse.json();
      setDataSources(sourcesData);

      if (dataSetResponse.ok) {
        const dataSetData = await dataSetResponse.json();
        setDataSet(dataSetData);
        setDescription(dataSetData.description || '');
        setDataSetType(dataSetData.type || 'combined');
        const dataSourceIds = Array.isArray(dataSetData.dataSourceIds)
          ? dataSetData.dataSourceIds.filter((id: unknown): id is string => typeof id === 'string')
          : [];
        setSelectedDataSources(new Set<string>(dataSourceIds));

        const dataSetIdsArray = Array.isArray(dataSetData.dataSetIds)
          ? dataSetData.dataSetIds.filter((id: unknown): id is string => typeof id === 'string')
          : [];
        const dataSetIds = new Set<string>(dataSetIdsArray);
        setSelectedDataSets(dataSetIds);
        
        if (dataSetIds.size > 0) {
          setDataSetType('combined');
        }
        
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

      if (setsResponse.ok) {
        const setsData = await setsResponse.json();
        setDataSets(setsData.filter((ds: DataSet) => ds.id !== dataSetId));
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
    if (selectedDataSets.size > 0) {
      setDataSetType('combined');
    }
  }, [selectedDataSets.size]);

  useEffect(() => {
    if (dataSetType === 'preaggregated' && selectedDataSources.size > 0) {
      const newConfig = new Map(preaggregationConfig);
      selectedDataSources.forEach(dataSourceId => {
        if (!newConfig.has(dataSourceId)) {
          newConfig.set(dataSourceId, {
            dataSourceId,
            interval: 1,
            timeUnit: 'seconds',
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
  }, [dataSetType, selectedDataSources]);

  const removeDataSource = useCallback((id: string) => {
    setSelectedDataSources(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const removeDataSet = useCallback((id: string) => {
    setSelectedDataSets(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
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
    const selectedSets = Array.from(selectedDataSets);
    const totalSelected = selectedSources.length + selectedSets.length;

    if (totalSelected === 0) {
      setError('At least one data source or data set must be selected');
      return;
    }

    let finalType: DataSetType | undefined;
    if (selectedSets.length > 0) {
      finalType = 'combined';
    } else if (totalSelected > 1) {
      finalType = dataSetType;
    }

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
          dataSetIds: selectedSets,
          preaggregationConfig: preaggConfig,
          useAggregation: useAggregation,
          aggregationFunction: aggregationFunction,
          aggregationInterval: aggregationInterval,
          aggregationTimeUnit: aggregationTimeUnit,
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
  }, [dataSetId, description, selectedDataSources, selectedDataSets, dataSetType, preaggregationConfig, useAggregation, aggregationFunction, aggregationInterval, aggregationTimeUnit, router]);

  return {
    dataSet,
    dataSources,
    dataSets,
    selectedDataSources,
    selectedDataSets,
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
    removeDataSource,
    removeDataSet,
    updatePreaggregationConfig,
    save,
  };
}
