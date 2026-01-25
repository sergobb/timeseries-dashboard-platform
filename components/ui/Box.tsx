import { ReactNode, HTMLAttributes } from 'react';

interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function Box({ children, className = '', ...props }: BoxProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

