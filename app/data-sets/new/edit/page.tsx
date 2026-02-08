'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ErrorMessage from '@/components/ErrorMessage';
import PageContainer from '@/components/PageContainer';
import PageTitle from '@/components/ui/PageTitle';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import InfoMessage from '@/components/ui/InfoMessage';

interface DataSource {
  id: string;
  connectionId: string;
  schemaName?: string;
  tableName: string;
  description?: string;
  columns: Array<{
    columnName: string;
    dataType: string;
    description?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface DataSet {
  id: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

type DataSetType = 'combined' | 'preaggregated';
type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days';
type AggregationFunction = 'none' | 'average' | 'minimum' | 'maximum';

interface PreaggregationConfig {
  dataSourceId: string;
  interval: number;
  timeUnit: TimeUnit;
}

export default function NewDataSetEditPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <InfoMessage message="Loading..." size="base" />
        </PageContainer>
      }
    >
      <NewDataSetEditPageInner />
    </Suspense>
  );
}

function NewDataSetEditPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const roles = session?.user?.roles ?? [];
  const canViewMetadata = roles.includes('metadata_editor');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [selectedDataSources, setSelectedDataSources] = useState<Set<string>>(new Set());
  const [selectedDataSets, setSelectedDataSets] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [dataSetType, setDataSetType] = useState<DataSetType>('combined');
  const [creating, setCreating] = useState(false);
  const [preaggregationConfig, setPreaggregationConfig] = useState<Map<string, PreaggregationConfig>>(new Map());
  const [useAggregation, setUseAggregation] = useState(false);
  const [aggregationFunction, setAggregationFunction] = useState<AggregationFunction>('none');
  const [aggregationInterval, setAggregationInterval] = useState(1);
  const [aggregationTimeUnit, setAggregationTimeUnit] = useState<TimeUnit>('seconds');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && !canViewMetadata) {
      setLoading(false);
      return;
    }
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router, canViewMetadata]);

  useEffect(() => {
    // Restore selection from query params
    const sourcesParam = searchParams.get('sources');
    const setsParam = searchParams.get('sets');
    
    if (sourcesParam) {
      const sourceIds = sourcesParam.split(',').filter(Boolean);
      setSelectedDataSources(new Set(sourceIds));
    }
    
    if (setsParam) {
      const setIds = setsParam.split(',').filter(Boolean);
      setSelectedDataSets(new Set(setIds));
    }
  }, [searchParams]);

  // Auto-set type to 'combined' if Data Sets are selected
  useEffect(() => {
    if (selectedDataSets.size > 0) {
      setDataSetType('combined');
    }
  }, [selectedDataSets.size]);

  // Initialize preaggregation config for selected data sources when type is preaggregated
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
      // Remove configs for unselected sources
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

  const fetchData = async () => {
    try {
      // Fetch data sources
      const sourcesResponse = await fetch('/api/data-sources', {
        credentials: 'include',
      });
      if (!sourcesResponse.ok) {
        throw new Error('Failed to fetch data sources');
      }
      const sourcesData = await sourcesResponse.json();
      setDataSources(sourcesData);

      // Fetch data sets
      const setsResponse = await fetch('/api/data-sets', {
        credentials: 'include',
      });
      if (setsResponse.ok) {
        const setsData = await setsResponse.json();
        setDataSets(setsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDataSource = (dataSourceId: string) => {
    const newSelected = new Set(selectedDataSources);
    newSelected.delete(dataSourceId);
    setSelectedDataSources(newSelected);
  };

  const handleRemoveDataSet = (dataSetId: string) => {
    const newSelected = new Set(selectedDataSets);
    newSelected.delete(dataSetId);
    setSelectedDataSets(newSelected);
  };

  const handleCreateDataSet = async () => {
    // Validate description
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

    // Determine type: if Data Sets are selected, it must be 'combined'
    // Otherwise, use selected type if multiple sources, or undefined if single source
    let finalType: DataSetType | undefined;
    if (selectedSets.length > 0) {
      finalType = 'combined';
    } else if (totalSelected > 1) {
      finalType = dataSetType;
    }

    // Prepare preaggregation config
    const preaggConfig = finalType === 'preaggregated' 
      ? Array.from(preaggregationConfig.values())
      : [];

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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create data set');
      }

      // Redirect to data sets list
      router.push('/data-sets');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create data set');
    } finally {
      setCreating(false);
    }
  };

  const getSelectedDataSourcesList = () => {
    return dataSources.filter(ds => selectedDataSources.has(ds.id));
  };

  const getSelectedDataSetsList = () => {
    return dataSets.filter(ds => selectedDataSets.has(ds.id));
  };

  if (status === 'loading' || loading) {
    return (
      <PageContainer>
        <InfoMessage message="Loading..." size="base" />
      </PageContainer>
    );
  }

  if (status === 'authenticated' && !canViewMetadata) {
    return (
      <PageContainer>
        <ErrorMessage message="Недостаточно прав. Требуется роль: metadata_editor." className="mb-4" />
        <Button onClick={() => router.push('/')} variant="secondary">
          На главную
        </Button>
      </PageContainer>
    );
  }

  const selectedSourcesList = getSelectedDataSourcesList();
  const selectedSetsList = getSelectedDataSetsList();
  const totalSelected = selectedDataSources.size + selectedDataSets.size;
  const hasMultipleSources = totalSelected > 1;
  // Show type selection only if no Data Sets are selected and multiple sources
  const showTypeSelection = hasMultipleSources && selectedDataSets.size === 0;
  const showAggregationSection = totalSelected >= 1 && (totalSelected === 1 || dataSetType === 'combined');

  return (
    <PageContainer flex innerClassName="lg:flex-1 flex flex-col lg:min-h-0">
        <PageTitle className="mb-6">Create Data Set</PageTitle>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {totalSelected === 0 && (
          <div className="mb-4 rounded-md bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            No sources selected. Please go back and select data sources or data sets.
          </div>
        )}

        <div className="bg-[var(--color-surface)] text-[var(--color-foreground)] rounded-lg shadow p-6 flex flex-col lg:min-h-0 max-h-[768px] lg:max-h-none flex-1">
          <div className="flex flex-col gap-6 flex-1 overflow-y-auto lg:min-h-0 mb-6">
            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (error && e.target.value.trim()) {
                    setError('');
                  }
                }}
                placeholder="Enter data set description..."
                rows={4}
                required
                className="resize-none"
              />
            </div>

            {/* Data Set Type Selection (only if multiple sources and no Data Sets selected) */}
            {showTypeSelection && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Data Set Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 rounded-md border border-[var(--color-border)] hover:border-[var(--color-border-muted)] cursor-pointer">
                    <input
                      type="radio"
                      name="dataSetType"
                      value="combined"
                      checked={dataSetType === 'combined'}
                      onChange={(e) => setDataSetType(e.target.value as DataSetType)}
                      className="mr-3 h-4 w-4 text-[var(--color-accent)] focus:ring-[var(--color-ring)] border-[var(--color-border)]"
                    />
                    <div>
                      <div className="font-medium text-[var(--color-foreground)]">
                        Combined Data Set
                      </div>
                      <div className="text-xs text-[var(--color-muted-foreground)] mt-1">
                        Combine multiple data sources into a single data set
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 rounded-md border border-[var(--color-border)] hover:border-[var(--color-border-muted)] cursor-pointer">
                    <input
                      type="radio"
                      name="dataSetType"
                      value="preaggregated"
                      checked={dataSetType === 'preaggregated'}
                      onChange={(e) => setDataSetType(e.target.value as DataSetType)}
                      className="mr-3 h-4 w-4 text-[var(--color-accent)] focus:ring-[var(--color-ring)] border-[var(--color-border)]"
                    />
                    <div>
                      <div className="font-medium text-[var(--color-foreground)]">
                        Pre-aggregated Data Set
                      </div>
                      <div className="text-xs text-[var(--color-muted-foreground)] mt-1">
                        Create a data set with pre-aggregated data from multiple sources
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Use aggregation (single source or Combined Data Set) */}
            {showAggregationSection && (
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAggregation}
                    onChange={(e) => setUseAggregation(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-ring)]"
                  />
                  <span className="text-sm font-medium text-[var(--color-foreground)]">
                    Use aggregation
                  </span>
                </label>
                {useAggregation && (
                  <div className="mt-3 pl-6 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">
                        Aggregation function
                      </label>
                      <select
                        value={aggregationFunction}
                        onChange={(e) => setAggregationFunction(e.target.value as AggregationFunction)}
                        className="w-full max-w-xs rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-2 py-1.5 text-sm text-[var(--color-foreground)] shadow-sm focus:border-[var(--color-ring)] focus:outline-none focus:ring-[var(--color-ring)]"
                      >
                        <option value="none">No aggregation function</option>
                        <option value="average">Average</option>
                        <option value="minimum">Minimum</option>
                        <option value="maximum">Maximum</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 max-w-[8rem]">
                        <label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">
                          Interval
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={aggregationInterval}
                          onChange={(e) => setAggregationInterval(parseInt(e.target.value) || 1)}
                          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-2 py-1 text-sm text-[var(--color-foreground)] shadow-sm focus:border-[var(--color-ring)] focus:outline-none focus:ring-[var(--color-ring)]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">
                          Time Unit
                        </label>
                        <select
                          value={aggregationTimeUnit}
                          onChange={(e) => setAggregationTimeUnit(e.target.value as TimeUnit)}
                          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-2 py-1 text-sm text-[var(--color-foreground)] shadow-sm focus:border-[var(--color-ring)] focus:outline-none focus:ring-[var(--color-ring)]"
                        >
                          <option value="seconds">Seconds</option>
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Selected Data Sources List */}
            {selectedSourcesList.length > 0 && (
              <div className="flex-1 min-h-0">
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Selected Data Sources ({selectedDataSources.size})
                </label>
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {selectedSourcesList.map((dataSource) => {
                    const displayName = dataSource.schemaName 
                      ? `${dataSource.schemaName}.${dataSource.tableName}` 
                      : dataSource.tableName;
                    const config = preaggregationConfig.get(dataSource.id);
                    const showPreaggFields = dataSetType === 'preaggregated';

                    return (
                      <div
                        key={dataSource.id}
                        className="p-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-[var(--color-foreground)]">
                              {displayName}
                            </div>
                            {dataSource.description && (
                              <div className="text-sm text-[var(--color-muted-foreground)] mt-1">
                                {dataSource.description}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveDataSource(dataSource.id)}
                            className="ml-3 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Remove data source"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                        {showPreaggFields && (
                          <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex gap-3">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">
                                Interval
                              </label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={config?.interval || 1}
                                onChange={(e) => {
                                  const newConfig = new Map(preaggregationConfig);
                                  newConfig.set(dataSource.id, {
                                    dataSourceId: dataSource.id,
                                    interval: parseInt(e.target.value) || 1,
                                    timeUnit: config?.timeUnit || 'seconds',
                                  });
                                  setPreaggregationConfig(newConfig);
                                }}
                                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-2 py-1 text-sm text-[var(--color-foreground)] shadow-sm focus:border-[var(--color-ring)] focus:outline-none focus:ring-[var(--color-ring)]"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">
                                Time Unit
                              </label>
                              <select
                                value={config?.timeUnit || 'seconds'}
                                onChange={(e) => {
                                  const newConfig = new Map(preaggregationConfig);
                                  newConfig.set(dataSource.id, {
                                    dataSourceId: dataSource.id,
                                    interval: config?.interval || 1,
                                    timeUnit: e.target.value as TimeUnit,
                                  });
                                  setPreaggregationConfig(newConfig);
                                }}
                                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-2 py-1 text-sm text-[var(--color-foreground)] shadow-sm focus:border-[var(--color-ring)] focus:outline-none focus:ring-[var(--color-ring)]"
                              >
                                <option value="seconds">Seconds</option>
                                <option value="minutes">Minutes</option>
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Data Sets List */}
            {selectedSetsList.length > 0 && (
              <div className="flex-1 min-h-0">
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Selected Data Sets ({selectedDataSets.size})
                </label>
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {selectedSetsList.map((dataSet) => (
                    <div
                      key={dataSet.id}
                      className="flex items-start justify-between p-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-[var(--color-foreground)]">
                          {dataSet.description || 'Data Set (no description)'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveDataSet(dataSet.id)}
                        className="ml-3 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Remove data set"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Create Button */}
          <div className="pt-4 border-t border-[var(--color-border)] mt-auto">
            <div className="flex gap-3">
              <Button
                onClick={() => router.back()}
                variant="secondary"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleCreateDataSet}
                disabled={totalSelected === 0 || creating || !description.trim()}
                className="flex-1"
              >
                {creating ? 'Creating...' : 'Create Data Set'}
              </Button>
            </div>
          </div>
        </div>
    </PageContainer>
  );
}

