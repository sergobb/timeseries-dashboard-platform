import { HTMLAttributes } from 'react';

interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Divider({ className = '', ...props }: DividerProps) {
  const baseClasses = 'border-t border-[var(--color-border)]';
  const classes = `${baseClasses} ${className}`.trim();

  return <div className={classes} {...props} />;
}

