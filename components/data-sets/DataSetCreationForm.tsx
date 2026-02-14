'use client';

import type { DataSetType, TimeUnit, AggregationFunction } from '@/types/data-set';
import type { Tag } from '@/types/tag';
import type { DataSource } from '@/types/data-source';
import type { DataSet } from '@/types/data-set';
import ErrorMessage from '@/components/ErrorMessage';
import PageContainer from '@/components/PageContainer';
import PageTitle from '@/components/ui/PageTitle';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import DataSetCreationSelectedSources from './DataSetCreationSelectedSources';
import DataSetCreationSelectedSets from './DataSetCreationSelectedSets';
import TagSelector from '@/components/common/TagSelector';

interface DataSetCreationFormProps {
  description: string;
  error: string;
  totalSelected: number;
  dataSetType: DataSetType;
  useAggregation: boolean;
  aggregationFunction: AggregationFunction;
  aggregationInterval: number;
  aggregationTimeUnit: TimeUnit;
  creating: boolean;
  showTypeSelection: boolean;
  showAggregationSection: boolean;
  selectedSourcesList: DataSource[];
  selectedSetsList: DataSet[];
  preaggregationConfig: Map<string, { dataSourceId: string; interval: number; timeUnit: TimeUnit }>;
  onDescriptionChange: (value: string) => void;
  onErrorClear: () => void;
  onDataSetTypeChange: (value: DataSetType) => void;
  onUseAggregationChange: (value: boolean) => void;
  onAggregationFunctionChange: (value: AggregationFunction) => void;
  onAggregationIntervalChange: (value: number) => void;
  onAggregationTimeUnitChange: (value: TimeUnit) => void;
  tags: Tag[];
  tagsLoading: boolean;
  selectedTagIds: string[];
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
  onCreateTag: (name: string) => Promise<Tag | null>;
  onRemoveDataSource: (id: string) => void;
  onRemoveDataSet: (id: string) => void;
  onPreaggChange: (dataSourceId: string, updates: { interval?: number; timeUnit?: TimeUnit }) => void;
  onCreate: () => void;
  onBack: () => void;
}

export default function DataSetCreationForm({
  description,
  error,
  totalSelected,
  dataSetType,
  useAggregation,
  aggregationFunction,
  aggregationInterval,
  aggregationTimeUnit,
  creating,
  showTypeSelection,
  showAggregationSection,
  selectedSourcesList,
  selectedSetsList,
  preaggregationConfig,
  onDescriptionChange,
  onErrorClear,
  onDataSetTypeChange,
  onUseAggregationChange,
  onAggregationFunctionChange,
  onAggregationIntervalChange,
  onAggregationTimeUnitChange,
  tags,
  tagsLoading,
  selectedTagIds,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  onRemoveDataSource,
  onRemoveDataSet,
  onPreaggChange,
  onCreate,
  onBack,
}: DataSetCreationFormProps) {
  return (
    <PageContainer flex innerClassName="lg:flex-1 flex flex-col lg:min-h-0">
      <PageTitle className="mb-6">Create Data Set</PageTitle>
      {error && <ErrorMessage message={error} className="mb-4" />}
      <div className="mb-4">
        <TagSelector
          tags={tags}
          loading={tagsLoading}
          selectedTagIds={selectedTagIds}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
          onCreateTag={onCreateTag}
        />
      </div>
      {totalSelected === 0 && (
        <div className="mb-4 rounded-md border border-[var(--color-warning)] bg-[var(--color-surface)] p-4 text-[var(--color-warning)]">
          No sources selected. Please go back and select data sources or data sets.
        </div>
      )}
      <div className="bg-[var(--color-surface)] text-[var(--color-foreground)] rounded-lg shadow p-6 flex flex-col lg:min-h-0 max-h-[768px] lg:max-h-none flex-1">
        <div className="flex flex-col gap-6 flex-1 overflow-y-auto lg:min-h-0 mb-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
              Description <span className="text-[var(--color-error)]">*</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => {
                onDescriptionChange(e.target.value);
                if (error && e.target.value.trim()) onErrorClear();
              }}
              placeholder="Enter data set description..."
              rows={4}
              required
              className="resize-none"
            />
          </div>
          {showTypeSelection && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Data Set Type</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 rounded-md border border-[var(--color-border)] hover:border-[var(--color-border-muted)] cursor-pointer">
                  <input
                    type="radio"
                    name="dataSetType"
                    value="combined"
                    checked={dataSetType === 'combined'}
                    onChange={(e) => onDataSetTypeChange(e.target.value as DataSetType)}
                    className="mr-3 h-4 w-4 text-[var(--color-accent)] focus:ring-[var(--color-ring)] border-[var(--color-border)]"
                  />
                  <div>
                    <div className="font-medium text-[var(--color-foreground)]">Combined Data Set</div>
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
                    onChange={(e) => onDataSetTypeChange(e.target.value as DataSetType)}
                    className="mr-3 h-4 w-4 text-[var(--color-accent)] focus:ring-[var(--color-ring)] border-[var(--color-border)]"
                  />
                  <div>
                    <div className="font-medium text-[var(--color-foreground)]">Pre-aggregated Data Set</div>
                    <div className="text-xs text-[var(--color-muted-foreground)] mt-1">
                      Create a data set with pre-aggregated data from multiple sources
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}
          {showAggregationSection && (
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAggregation}
                  onChange={(e) => onUseAggregationChange(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-ring)]"
                />
                <span className="text-sm font-medium text-[var(--color-foreground)]">Use aggregation</span>
              </label>
              {useAggregation && (
                <div className="mt-3 pl-6 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">
                      Aggregation function
                    </label>
                    <select
                      value={aggregationFunction}
                      onChange={(e) => onAggregationFunctionChange(e.target.value as AggregationFunction)}
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
                      <label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">Interval</label>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={aggregationInterval}
                        onChange={(e) => onAggregationIntervalChange(parseInt(e.target.value) || 1)}
                        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-2 py-1 text-sm text-[var(--color-foreground)] shadow-sm focus:border-[var(--color-ring)] focus:outline-none focus:ring-[var(--color-ring)]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">Time Unit</label>
                      <select
                        value={aggregationTimeUnit}
                        onChange={(e) => onAggregationTimeUnitChange(e.target.value as TimeUnit)}
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
          <DataSetCreationSelectedSources
            sources={selectedSourcesList}
            dataSetType={dataSetType}
            preaggregationConfig={preaggregationConfig}
            onRemove={onRemoveDataSource}
            onPreaggChange={onPreaggChange}
          />
          <DataSetCreationSelectedSets sets={selectedSetsList} onRemove={onRemoveDataSet} />
        </div>
        <div className="pt-4 border-t border-[var(--color-border)] mt-auto">
          <div className="flex gap-3">
            <Button onClick={onBack} variant="secondary" className="flex-1">
              Back
            </Button>
            <Button
              onClick={onCreate}
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
