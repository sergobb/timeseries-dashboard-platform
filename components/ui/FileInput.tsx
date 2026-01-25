import { InputHTMLAttributes, forwardRef, ReactNode, useId } from 'react';

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className' | 'onChange'> {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: ReactNode;
  accept?: string;
  className?: string;
  labelClassName?: string;
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ label, accept, onChange, className = '', labelClassName = '', disabled, ...props }, ref) => {
    const id = useId();

    const defaultLabelClasses =
      'cursor-pointer px-4 py-2 rounded-md border border-[var(--color-border)] text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors';

    return (
      <div className={className}>
        <input
          ref={ref}
          type="file"
          id={id}
          accept={accept}
          onChange={onChange}
          disabled={disabled}
          className="hidden"
          {...props}
        />
        <label
          htmlFor={id}
          className={`${defaultLabelClasses} ${labelClassName} ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`.trim()}
        >
          {label || 'Выбрать файл'}
        </label>
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';

export default FileInput;

