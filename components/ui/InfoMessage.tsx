interface InfoMessageProps {
  message: string;
  size?: 'sm' | 'base';
  className?: string;
}

export default function InfoMessage({ message, size = 'sm', className = '' }: InfoMessageProps) {
  const baseClasses = 'text-[var(--color-muted-foreground)]';
  const sizeClasses = size === 'sm' ? 'text-sm' : '';
  const classes = `${baseClasses} ${sizeClasses} ${className}`.trim();

  return <p className={classes}>{message}</p>;
}

