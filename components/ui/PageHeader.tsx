import { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function PageHeader({ title, action, className = '' }: PageHeaderProps) {
  const baseClasses = 'flex justify-between items-center mb-8';
  const classes = `${baseClasses} ${className}`.trim();

  return (
    <div className={classes}>
      {title}
      {action && <div>{action}</div>}
    </div>
  );
}

