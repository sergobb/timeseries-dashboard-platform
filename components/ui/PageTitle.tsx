import { ReactNode } from 'react';

interface PageTitleProps {
  children: ReactNode;
  className?: string;
}

export default function PageTitle({ children, className = '' }: PageTitleProps) {
  const baseClasses = 'text-3xl font-bold text-[var(--color-foreground)]';
  const classes = `${baseClasses} ${className}`.trim();

  return <h1 className={classes}>{children}</h1>;
}

