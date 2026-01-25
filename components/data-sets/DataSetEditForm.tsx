import { DataSetType, PreaggregationConfig } from '@/types/data-set';
import { DataSource } from '@/types/data-source';
import { DataSet } from '@/types/data-set';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

interface DataSetEditFormProps {
  description: string;
  dataSetType: DataSetType;
  selectedDataSources: DataSource[];
  selectedDataSets: DataSet[];
  preaggregationConfig: Map<string, PreaggregationConfig>;
  showTypeSelection: boolean;
  saving: boolean;
  onDescriptionChange: (value: string) => void;
  onTypeChange: (type: DataSetType) => void;
  onRemoveDataSource: (id: string) => void;
  onRemoveDataSet: (id: string) => void;
  onPreaggregationConfigChange: (dataSourceId: string, config: PreaggregationConfig) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function DataSetEditForm({
  description,
  dataSetType,
  selectedDataSources,
  selectedDataSets,
  preaggregationConfig,
  showTypeSelection,
  saving,
  onDescriptionChange,
  onTypeChange,
  onRemoveDataSource,
  onRemoveDataSet,
  onPreaggregationConfigChange,
  onSave,
  onCancel,
}: DataSetEditFormProps) {
  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-foreground)] rounded-lg shadow p-6 flex flex-col lg:min-h-0 max-h-[768px] lg:max-h-none flex-1">
      <div className="flex flex-col gap-6 flex-1 overflow-y-auto lg:min-h-0 mb-6">
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
            Description <span className="text-red-500">*</span>
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
                  onChange={(e) => onTypeChange(e.target.value as DataSetType)}
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
                  onChange={(e) => onTypeChange(e.target.value as DataSetType)}
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

        {selectedDataSources.length > 0 && (
          <div className="flex-1 min-h-0">
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
              Selected Data Sources ({selectedDataSources.length})
            </label>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {selectedDataSources.map((dataSource) => {
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
                        onClick={() => onRemoveDataSource(dataSource.id)}
                        className="ml-3 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Remove data source"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                            onChange={(e) => onPreaggregationConfigChange(dataSource.id, {
                              dataSourceId: dataSource.id,
                              interval: parseInt(e.target.value) || 1,
                              timeUnit: config?.timeUnit || 'seconds',
                            })}
                            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-2 py-1 text-sm text-[var(--color-foreground)] shadow-sm focus:border-[var(--color-ring)] focus:outline-none focus:ring-[var(--color-ring)]"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">
                            Time Unit
                          </label>
                          <select
                            value={config?.timeUnit || 'seconds'}
                            onChange={(e) => onPreaggregationConfigChange(dataSource.id, {
                              dataSourceId: dataSource.id,
                              interval: config?.interval || 1,
                              timeUnit: e.target.value as PreaggregationConfig['timeUnit'],
                            })}
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

        {selectedDataSets.length > 0 && (
          <div className="flex-1 min-h-0">
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
              Selected Data Sets ({selectedDataSets.length})
            </label>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {selectedDataSets.map((dataSet) => (
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
                    onClick={() => onRemoveDataSet(dataSet.id)}
                    className="ml-3 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    title="Remove data set"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
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
