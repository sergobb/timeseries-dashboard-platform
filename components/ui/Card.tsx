import { ReactNode, HTMLAttributes } from "react";

type CardVariant = "default" | "interactive" | "muted" | "danger";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
}

export default function Card({
  children,
  className = "",
  variant = "default",
  ...props
}: CardProps) {
  const baseClasses =
    "rounded-lg shadow transition-colors duration-200 text-[var(--color-foreground)]";
  const variantClasses: Record<CardVariant, string> = {
    default: "bg-[var(--color-surface)]",
    interactive:
      "bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] hover:shadow-md hover:border-[var(--color-accent)]/30 border border-transparent cursor-pointer",
    muted: "bg-[var(--color-surface-muted)] border border-[var(--color-border-muted)]",
    danger:
      "bg-[var(--color-surface)] border border-[var(--color-error)]/30",
  };
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={`border-b border-[var(--color-border-muted)] px-4 py-3 font-display font-semibold text-[var(--color-foreground)] ${className}`.trim()}
    >
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`p-4 ${className}`.trim()}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div
      className={`border-t border-[var(--color-border-muted)] px-4 py-3 flex items-center justify-end gap-2 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
