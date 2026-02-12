import { ReactNode, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "", ...props }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table
        className={`w-full border-collapse text-sm ${className}`.trim()}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return (
    <thead
      className={`bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] ${className}`.trim()}
    >
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  className?: string;
}

export function TableRow({ children, className = "", ...props }: TableRowProps) {
  return (
    <tr
      className={`border-b border-[var(--color-border-muted)] last:border-0 hover:bg-[var(--color-surface-subtle)] transition-colors ${className}`.trim()}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  className?: string;
}

export function TableCell({ children, className = "", ...props }: TableCellProps) {
  return (
    <td
      className={`px-4 py-3 text-[var(--color-foreground)] ${className}`.trim()}
      {...props}
    >
      {children}
    </td>
  );
}

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  className?: string;
}

export function TableHead({ children, className = "", ...props }: TableHeadProps) {
  return (
    <th
      className={`px-4 py-3 text-left font-medium text-[var(--color-foreground)] ${className}`.trim()}
      {...props}
    >
      {children}
    </th>
  );
}
