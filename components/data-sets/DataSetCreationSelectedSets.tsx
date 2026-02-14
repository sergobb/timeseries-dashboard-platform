'use client';

import type { DataSet } from '@/types/data-set';

interface DataSetCreationSelectedSetsProps {
  sets: DataSet[];
  onRemove: (id: string) => void;
}

export default function DataSetCreationSelectedSets({ sets, onRemove }: DataSetCreationSelectedSetsProps) {
  if (sets.length === 0) return null;

  return (
    <div className="flex-1 min-h-0">
      <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
        Selected Data Sets ({sets.length})
      </label>
      <div className="space-y-2 flex-1 overflow-y-auto">
        {sets.map((dataSet) => (
          <div
            key={dataSet.id}
            className="flex items-start justify-between p-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
          >
            <div className="flex-1">
              <div className="font-medium text-[var(--color-foreground)] whitespace-pre-wrap">
                {dataSet.description || 'Data Set (no description)'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(dataSet.id)}
              className="ml-3 text-[var(--color-error)] hover:opacity-80"
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
  );
}
