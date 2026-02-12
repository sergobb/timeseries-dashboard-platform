import { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  action,
  className = "",
}: PageHeaderProps) {
  const baseClasses = "flex flex-wrap justify-between items-start gap-4 mb-8";
  const classes = `${baseClasses} ${className}`.trim();

  return (
    <div className={classes}>
      <div className="min-w-0">
        {title}
        {description && (
          <div className="mt-1 text-[var(--color-muted-foreground)] text-sm">
            {description}
          </div>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

