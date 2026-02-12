import { ReactNode } from "react";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)] py-12 px-6 text-center ${className}`.trim()}
    >
      {icon && (
        <div className="mb-4 text-[var(--color-muted-foreground)] [&>svg]:h-12 [&>svg]:w-12">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-[var(--color-foreground)] mb-2">
        {title}
      </h3>
      {description && (
        <Text size="sm" variant="muted" className="mb-6 max-w-sm">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
