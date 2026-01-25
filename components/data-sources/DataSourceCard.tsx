import { ReactNode } from 'react';

interface DataSourceCardProps {
  children: ReactNode;
  className?: string;
}

export default function DataSourceCard({ children, className = '' }: DataSourceCardProps) {
  const baseClasses = 'p-6 bg-[var(--color-surface)] text-[var(--color-foreground)] rounded-lg shadow hover:shadow-lg transition-shadow';
  const classes = `${baseClasses} ${className}`.trim();

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

