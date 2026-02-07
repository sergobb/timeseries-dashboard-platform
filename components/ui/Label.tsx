'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { forwardRef, ReactNode } from 'react';

interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  children: ReactNode;
  className?: string;
}

const Label = forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({ children, className = '', ...props }, ref) => {
    const baseClasses = 'block text-sm font-medium text-[var(--color-foreground)]';
    const classes = `${baseClasses} ${className}`.trim();

    return (
      <LabelPrimitive.Root ref={ref} className={classes} {...props}>
        {children}
      </LabelPrimitive.Root>
    );
  }
);

Label.displayName = 'Label';

export default Label;
