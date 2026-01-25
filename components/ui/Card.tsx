import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '', ...props }: CardProps) {
  const baseClasses = 'bg-[var(--color-surface)] text-[var(--color-foreground)] rounded-lg shadow';
  const classes = `${baseClasses} ${className}`.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

