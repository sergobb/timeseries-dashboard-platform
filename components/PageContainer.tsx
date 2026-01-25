import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  flex?: boolean;
}

export default function PageContainer({
  children,
  className = '',
  innerClassName = '',
  flex = false,
}: PageContainerProps) {
  const baseClasses = 'h-full bg-[var(--color-background)] p-8';
  const flexClasses = flex ? 'flex flex-col' : '';
  const containerClasses = `${baseClasses} ${flexClasses} ${className}`.trim();

  const baseInnerClasses = 'w-full';
  const innerClasses = `${baseInnerClasses} ${innerClassName}`.trim();

  return (
    <div className={containerClasses}>
      <div className={innerClasses}>
        {children}
      </div>
    </div>
  );
}

