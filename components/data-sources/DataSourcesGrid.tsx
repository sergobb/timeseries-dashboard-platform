import { ReactNode } from 'react';

interface DataSourcesGridProps {
  children: ReactNode;
  className?: string;
}

export default function DataSourcesGrid({ children, className = '' }: DataSourcesGridProps) {
  const baseClasses = 'grid grid-cols-1 lg:grid-cols-3 gap-6 lg:flex-1 lg:min-h-0 mb-6 lg:mb-0';
  const classes = `${baseClasses} ${className}`.trim();

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

