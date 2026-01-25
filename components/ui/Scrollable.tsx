import { ReactNode, HTMLAttributes } from 'react';

interface ScrollableProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxHeight?: string;
  className?: string;
}

export default function Scrollable({ 
  children, 
  maxHeight,
  className = '',
  ...props 
}: ScrollableProps) {
  const style = maxHeight ? { maxHeight } : undefined;
  const baseClasses = 'space-y-2 overflow-y-auto';
  const classes = `${baseClasses} ${className}`.trim();

  return (
    <div className={classes} style={style} {...props}>
      {children}
    </div>
  );
}

