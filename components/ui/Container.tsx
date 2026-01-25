import { ReactNode, HTMLAttributes } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  className?: string;
}

export default function Container({ 
  children, 
  maxWidth = 'full',
  className = '',
  ...props 
}: ContainerProps) {
  const baseClasses = '';
  
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full',
  };

  const classes = `${baseClasses} ${maxWidthClasses[maxWidth]} mx-auto ${className}`.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

