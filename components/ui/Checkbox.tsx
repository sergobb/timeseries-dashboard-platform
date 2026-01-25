import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  className?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', ...props }, ref) => {
    const baseClasses =
      'h-4 w-4 text-[var(--color-accent)] focus:ring-[var(--color-ring)] border-[var(--color-border)] rounded disabled:opacity-50 disabled:cursor-not-allowed';
    const classes = `${baseClasses} ${className}`.trim();

    return <input ref={ref} type="checkbox" className={classes} {...props} />;
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;

