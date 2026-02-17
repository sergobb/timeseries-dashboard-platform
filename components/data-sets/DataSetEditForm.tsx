import { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { DataSetType, PreaggregationConfig, AggregationFunction, TimeUnit } from '@/types/data-set';
import { DataSource } from '@/types/data-source';
import { Tag } from '@/types/tag';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import TagSelector from '@/components/common/TagSelector';
import DataSetSelectionPanel from '@/components/data-sets/DataSetSelectionPanel';
import DataSetFormTypeSection from '@/components/data-sets/DataSetFormTypeSection';
import DataSetFormAggregationSection from '@/components/data-sets/DataSetFormAggregationSection';
import DataSetEditFormSelectedSources from '@/components/data-sets/DataSetEditFormSelectedSources';

interface DataSetEditFormProps {
  description: string;
  dataSetType: DataSetType;
  selectedDataSources: DataSource[];
  preaggregationConfig: Map<string, PreaggregationConfig>;
  showTypeSelection: boolean;
  showAggregationSection: boolean;
  useAggregation: boolean;
  aggregationFunction: AggregationFunction;
  aggregationInterval: number;
  aggregationTimeUnit: TimeUnit;
  saving: boolean;
  onDescriptionChange: (value: string) => void;
  onTypeChange: (type: DataSetType) => void;
  availableDataSources: DataSource[];
  onAddDataSource: (id: string) => void;
  onRemoveDataSource: (id: string) => void;
  onPreaggregationConfigChange: (dataSourceId: string, config: PreaggregationConfig) => void;
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
  onSave: () => void;
  onCancel: () => void;
}

export default function DataSetEditForm({
  description,
  dataSetType,
  selectedDataSources,
  preaggregationConfig,
  showTypeSelection,
  showAggregationSection,
  useAggregation,
  aggregationFunction,
  aggregationInterval,
  aggregationTimeUnit,
  saving,
  onDescriptionChange,
  onTypeChange,
  availableDataSources,
  onAddDataSource,
  onRemoveDataSource,
  onPreaggregationConfigChange,
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
  onSave,
  onCancel,
}: DataSetEditFormProps) {
  const [addSourceFilter, setAddSourceFilter] = useState('');

  const handleAddAllSources = () => {
    availableDataSources.forEach((ds) => onAddDataSource(ds.id));
  };

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-foreground)] rounded-lg shadow p-6 flex flex-col lg:min-h-0 max-h-[768px] lg:max-h-none flex-1">
      <div className="flex flex-col gap-6 flex-1 overflow-y-auto lg:min-h-0 mb-6">
        <div>
          <TagSelector
            tags={tags}
            loading={tagsLoading}
            selectedTagIds={selectedTagIds}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
            onCreateTag={onCreateTag}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
            Description <span className="text-[var(--color-error)]">*</span>
          </label>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Enter data set description..."
            rows={4}
            required
            className="resize-none"
          />
        </div>

        {showTypeSelection && (
          <DataSetFormTypeSection dataSetType={dataSetType} onTypeChange={onTypeChange} />
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

        {selectedDataSources.length > 0 && (
          <DataSetEditFormSelectedSources
            selectedDataSources={selectedDataSources}
            dataSetType={dataSetType}
            preaggregationConfig={preaggregationConfig}
            onRemoveDataSource={onRemoveDataSource}
            onPreaggregationConfigChange={onPreaggregationConfigChange}
          />
        )}

        {availableDataSources.length > 0 && (
          <Collapsible.Root className="group">
            <Collapsible.Trigger className="flex items-center gap-2 w-full py-2 text-sm font-medium text-[var(--color-accent)] hover:opacity-80 text-left">
              <svg className="w-4 h-4 transition-transform group-data-[state=open]:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Add data source ({availableDataSources.length} available)
            </Collapsible.Trigger>
            <Collapsible.Content>
              <div className="mt-2">
                <DataSetSelectionPanel
                  title="Add Data Source"
                  items={availableDataSources}
                  selectedIds={new Set()}
                  filter={addSourceFilter}
                  onFilterChange={setAddSourceFilter}
                  onToggle={onAddDataSource}
                  onSelectAll={handleAddAllSources}
                  allSelected={false}
                  getDisplayName={(ds) => (ds.schemaName ? `${ds.schemaName}.${ds.tableName}` : ds.tableName)}
                  getDescription={(ds) => ds.description}
                />
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        )}

      </div>

      <div className="pt-4 border-t border-[var(--color-border)] mt-auto">
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving || !description.trim()} className="flex-1">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
