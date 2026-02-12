import { ReactNode, HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  className?: string;
}

export default function Badge({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded text-xs font-medium';
  
  const variantClasses = {
    default: 'bg-[var(--color-muted)] text-[var(--color-foreground)]',
    success: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
    error: 'bg-[var(--color-error)]/15 text-[var(--color-error)]',
    warning: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
    info: 'bg-[var(--color-info)]/15 text-[var(--color-info)]',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

