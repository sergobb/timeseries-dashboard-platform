import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  children: ReactNode;
  className?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, className = '', ...props }, ref) => {
    const baseClasses =
      'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm focus:border-[var(--color-ring)] focus:outline-none focus:ring-[var(--color-ring)]';
    const classes = `${baseClasses} ${className}`.trim();

    return (
      <select ref={ref} className={classes} {...props}>
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

export default Select;

