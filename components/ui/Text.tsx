import { ReactNode, HTMLAttributes } from 'react';

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg';
  variant?: 'default' | 'muted' | 'error' | 'warning';
  className?: string;
}

export default function Text({ 
  children, 
  size = 'base', 
  variant = 'default',
  className = '',
  ...props 
}: TextProps) {
  const baseClasses = '';
  
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  };

  const variantClasses = {
    default: 'text-[var(--color-foreground)]',
    muted: 'text-[var(--color-muted-foreground)]',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`.trim();

  return (
    <p className={classes} {...props}>
      {children}
    </p>
  );
}

