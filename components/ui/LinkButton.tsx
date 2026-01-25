import Link from 'next/link';
import { ReactNode, AnchorHTMLAttributes } from 'react';

interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'> {
  children: ReactNode;
  href: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LinkButton({ 
  children, 
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props 
}: LinkButtonProps) {
  const baseClasses =
    'inline-block rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)] text-center';
  
  const variantClasses = {
    primary: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90',
    secondary:
      'border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}

