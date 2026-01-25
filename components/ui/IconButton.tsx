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
      success: 'text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20',
      danger: 'text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20',
      warning: 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900/20',
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

