interface ErrorMessageProps {
  message: string;
  className?: string;
}

export default function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400 ${className}`}>
      {message}
    </div>
  );
}

