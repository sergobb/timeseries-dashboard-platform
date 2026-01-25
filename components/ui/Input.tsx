import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    const baseClasses =
      'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm focus:border-[var(--color-ring)] focus:outline-none focus:ring-[var(--color-ring)]';
    const classes = `${baseClasses} ${className}`.trim();

    return <input ref={ref} className={classes} {...props} />;
  }
);

Input.displayName = 'Input';

export default Input;

