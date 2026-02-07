'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { forwardRef } from 'react';

const baseClasses =
  'flex h-4 w-4 shrink-0 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed data-[state=checked]:bg-[var(--color-accent)] data-[state=checked]:border-[var(--color-accent)] data-[state=checked]:text-[var(--color-accent-foreground)]';

type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  className?: string;
  onChange?: (e: { target: { checked: boolean } }) => void;
};

const Checkbox = forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className = '', onChange, onCheckedChange, ...props }, ref) => {
    const handleCheckedChange = (checked: boolean | 'indeterminate') => {
      const value = checked === true;
      onCheckedChange?.(checked);
      onChange?.({ target: { checked: value } });
    };
    return (
  <CheckboxPrimitive.Root
    ref={ref}
    className={`${baseClasses} ${className}`.trim()}
    onCheckedChange={handleCheckedChange}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 3L4.5 8.5L2 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
