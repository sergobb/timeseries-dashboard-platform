import { ReactNode, HTMLAttributes } from 'react';

interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  direction?: 'row' | 'col';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  gap?: '0' | '1' | '2' | '3' | '4' | '6' | '8';
  className?: string;
}

export default function Flex({ 
  children, 
  direction = 'row',
  justify = 'start',
  align = 'start',
  gap = '0',
  className = '',
  ...props 
}: FlexProps) {
  const baseClasses = 'flex';
  
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const gapClasses = {
    '0': '',
    '1': 'gap-1',
    '2': 'gap-2',
    '3': 'gap-3',
    '4': 'gap-4',
    '6': 'gap-6',
    '8': 'gap-8',
  };

  const classes = `${baseClasses} ${directionClasses[direction]} ${justifyClasses[justify]} ${alignClasses[align]} ${gapClasses[gap]} ${className}`.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

