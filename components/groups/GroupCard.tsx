import { ReactNode } from 'react';

interface GroupCardProps {
  children: ReactNode;
  className?: string;
}

export default function GroupCard({ children, className = '' }: GroupCardProps) {
  const baseClasses = 'p-6 bg-[var(--color-surface)] text-[var(--color-foreground)] rounded-lg shadow hover:shadow-lg transition-shadow';
  const classes = `${baseClasses} ${className}`.trim();

  return <div className={classes}>{children}</div>;
}
