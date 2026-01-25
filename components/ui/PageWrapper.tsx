import { ReactNode, HTMLAttributes } from 'react';

interface PageWrapperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = '', ...props }: PageWrapperProps) {
  const baseClasses = 'min-h-screen bg-[var(--color-background)] p-8';
  const classes = `${baseClasses} ${className}`.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

