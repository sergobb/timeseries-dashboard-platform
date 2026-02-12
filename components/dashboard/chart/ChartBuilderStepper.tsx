'use client';

const STEPS = [
  { key: 'data', label: 'Data' },
  { key: 'series', label: 'Series' },
  { key: 'display', label: 'Display' },
] as const;

export default function ChartBuilderStepper() {
  return (
    <nav
      className="flex items-center gap-2 mb-6 font-mono text-xs text-[var(--color-muted-foreground)]"
      aria-label="Chart builder steps"
    >
      {STEPS.map((step, i) => (
        <span key={step.key} className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-surface-muted)] font-medium text-[var(--color-foreground)]"
            aria-current={i === 0 ? 'step' : undefined}
          >
            {i + 1}
          </span>
          <span>{step.label}</span>
          {i < STEPS.length - 1 && (
            <span className="ml-2 h-px w-4 bg-[var(--color-border-muted)]" aria-hidden />
          )}
        </span>
      ))}
    </nav>
  );
}
