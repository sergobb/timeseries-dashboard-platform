import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  className?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    const baseClasses =
      'w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-md bg-[var(--color-input)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]';
    const classes = `${baseClasses} ${className}`.trim();

    return <textarea ref={ref} className={classes} {...props} />;
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;

