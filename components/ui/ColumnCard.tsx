import { ReactNode, HTMLAttributes } from 'react';

interface ColumnCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  active?: boolean;
  className?: string;
}

export default function ColumnCard({ 
  children, 
  active = true,
  className = '',
  ...props 
}: ColumnCardProps) {
  const baseClasses = 'p-4 rounded-md border';
  
  const variantClasses = active
    ? 'border-[var(--color-border)] bg-[var(--color-surface)]'
    : 'border-[var(--color-border-muted)] bg-[var(--color-surface-muted)] opacity-60';

  const classes = `${baseClasses} ${variantClasses} ${className}`.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

