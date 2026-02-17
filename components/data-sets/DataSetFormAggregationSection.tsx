import type { AggregationFunction, TimeUnit } from '@/types/data-set';

interface DataSetFormAggregationSectionProps {
  useAggregation: boolean;
  aggregationFunction: AggregationFunction;
  aggregationInterval: number;
  aggregationTimeUnit: TimeUnit;
  onUseAggregationChange: (value: boolean) => void;
  onAggregationFunctionChange: (value: AggregationFunction) => void;
  onAggregationIntervalChange: (value: number) => void;
  onAggregationTimeUnitChange: (value: TimeUnit) => void;
}

export default function DataSetFormAggregationSection({
  useAggregation,
  aggregationFunction,
  aggregationInterval,
  aggregationTimeUnit,
  onUseAggregationChange,
  onAggregationFunctionChange,
  onAggregationIntervalChange,
  onAggregationTimeUnitChange,
}: DataSetFormAggregationSectionProps) {
  return (
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
              <label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">
                Interval
              </label>
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
              <label className="block text-xs font-medium text-[var(--color-foreground)] mb-1">
                Time Unit
              </label>
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
  );
}
