'use client';

import type { DataSetType, TimeUnit, AggregationFunction } from '@/types/data-set';
import type { Tag } from '@/types/tag';
import type { DataSource } from '@/types/data-source';
import ErrorMessage from '@/components/ErrorMessage';
import PageContainer from '@/components/PageContainer';
import PageTitle from '@/components/ui/PageTitle';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import DataSetCreationSelectedSources from './DataSetCreationSelectedSources';
import DataSetFormTypeSection from './DataSetFormTypeSection';
import DataSetFormAggregationSection from './DataSetFormAggregationSection';
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
            <DataSetFormTypeSection dataSetType={dataSetType} onTypeChange={onDataSetTypeChange} />
          )}
          {showAggregationSection && (
            <DataSetFormAggregationSection
              useAggregation={useAggregation}
              aggregationFunction={aggregationFunction}
              aggregationInterval={aggregationInterval}
              aggregationTimeUnit={aggregationTimeUnit}
              onUseAggregationChange={onUseAggregationChange}
              onAggregationFunctionChange={onAggregationFunctionChange}
              onAggregationIntervalChange={onAggregationIntervalChange}
              onAggregationTimeUnitChange={onAggregationTimeUnitChange}
            />
          )}
          <DataSetCreationSelectedSources
            sources={selectedSourcesList}
            dataSetType={dataSetType}
            preaggregationConfig={preaggregationConfig}
            onRemove={onRemoveDataSource}
            onPreaggChange={onPreaggChange}
          />
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
