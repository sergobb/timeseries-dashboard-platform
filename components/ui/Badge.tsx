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
    success: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

