import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  icon: ReactNode;
  tooltip?: string;
  className?: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'primary', icon, tooltip, className = '', title, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center p-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'text-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-muted)]',
      secondary: 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]',
      success: 'text-[var(--color-success)] hover:bg-[var(--color-success)]/10',
      danger: 'text-[var(--color-error)] hover:bg-[var(--color-error)]/10',
      warning: 'text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();
    
    // Используем tooltip, если передан, иначе используем title из props
    const buttonTitle = tooltip || title;

    return (
      <button 
        ref={ref} 
        className={classes} 
        {...props}
        title={buttonTitle}
      >
        <span className="flex-shrink-0">{icon}</span>
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;

