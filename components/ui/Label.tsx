import { LabelHTMLAttributes, forwardRef, ReactNode } from 'react';

interface LabelProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, 'className'> {
  children: ReactNode;
  className?: string;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className = '', ...props }, ref) => {
    const baseClasses = 'block text-sm font-medium text-[var(--color-foreground)]';
    const classes = `${baseClasses} ${className}`.trim();

    return (
      <label ref={ref} className={classes} {...props}>
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';

export default Label;

