import type { DataSetType } from '@/types/data-set';

interface DataSetFormTypeSectionProps {
  dataSetType: DataSetType;
  onTypeChange: (value: DataSetType) => void;
}

export default function DataSetFormTypeSection({
  dataSetType,
  onTypeChange,
}: DataSetFormTypeSectionProps) {
  return (
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
  );
}
