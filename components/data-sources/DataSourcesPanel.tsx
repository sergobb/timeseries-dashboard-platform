import { ReactNode } from 'react';

interface DataSourcesPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function DataSourcesPanel({ title, children, className = '' }: DataSourcesPanelProps) {
  const baseClasses =
    'bg-[var(--color-surface)] text-[var(--color-foreground)] rounded-lg shadow p-6 flex flex-col lg:min-h-0 max-h-[768px] lg:max-h-none';
  const classes = `${baseClasses} ${className}`.trim();

  return (
    <div className={classes}>
      <h2 className="text-xl font-semibold text-[var(--color-foreground)] mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

