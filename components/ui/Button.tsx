import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    const baseClasses =
      'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)] disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90',
      secondary: 'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:bg-[var(--color-border)]',
      danger: 'bg-[var(--color-error)] text-[var(--color-error-foreground)] hover:opacity-90',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

