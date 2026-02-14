'use client';

import type { DataSource } from '@/types/data-source';
import type { TimeUnit } from '@/types/data-set';

interface DataSetCreationSelectedSourcesProps {
  sources: DataSource[];
  dataSetType: 'combined' | 'preaggregated';
  preaggregationConfig: Map<string, { dataSourceId: string; interval: number; timeUnit: TimeUnit }>;
  onRemove: (id: string) => void;
  onPreaggChange: (dataSourceId: string, updates: { interval?: number; timeUnit?: TimeUnit }) => void;
}

export default function DataSetCreationSelectedSources({
  sources,
  dataSetType,
  preaggregationConfig,
  onRemove,
  onPreaggChange,
}: DataSetCreationSelectedSourcesProps) {
  if (sources.length === 0) return null;

  return (
    <div className="flex-1 min-h-0">
      <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
        Selected Data Sources ({sources.length})
      </label>
      <div className="space-y-2 flex-1 overflow-y-auto">
        {sources.map((dataSource) => {
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
                  <div className="font-medium text-[var(--color-foreground)]">{displayName}</div>
                  {dataSource.description && (
                    <div className="text-sm text-[var(--color-muted-foreground)] mt-1 whitespace-pre-wrap">
                      {dataSource.description}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(dataSource.id)}
                  className="ml-3 text-[var(--color-error)] hover:opacity-80"
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
                    <label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">Interval</label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={config?.interval ?? 1}
                      onChange={(e) => onPreaggChange(dataSource.id, { interval: parseInt(e.target.value) || 1 })}
                      className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-2 py-1 text-sm text-[var(--color-foreground)] shadow-sm focus:border-[var(--color-ring)] focus:outline-none focus:ring-[var(--color-ring)]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">Time Unit</label>
                    <select
                      value={config?.timeUnit ?? 'seconds'}
                      onChange={(e) => onPreaggChange(dataSource.id, { timeUnit: e.target.value as TimeUnit })}
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
  );
}
