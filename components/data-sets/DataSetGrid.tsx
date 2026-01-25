import { ReactNode } from 'react';

interface DataSetGridProps {
  children: ReactNode;
  className?: string;
}

export default function DataSetGrid({ children, className = '' }: DataSetGridProps) {
  const baseClasses = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  const classes = `${baseClasses} ${className}`.trim();

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

