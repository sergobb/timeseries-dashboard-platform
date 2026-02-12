interface ErrorMessageProps {
  message: string;
  className?: string;
}

export default function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`rounded-md border border-[var(--color-error)] bg-[var(--color-surface)] p-4 text-[var(--color-error)] ${className}`}>
      {message}
    </div>
  );
}

