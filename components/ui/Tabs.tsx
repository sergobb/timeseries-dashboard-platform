import { ReactNode } from 'react';

export interface TabsItem {
  readonly value: string;
  readonly label: ReactNode;
  readonly content: ReactNode;
  readonly disabled?: boolean;
}

interface TabsProps {
  value: string;
  items: readonly TabsItem[];
  onChange: (value: string) => void;
}

export default function Tabs({ value, items, onChange }: TabsProps) {
  const active = items.find((i) => i.value === value) ?? items[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)]">
        {items.map((item) => {
          const isActive = item.value === value;
          const isDisabled = Boolean(item.disabled);

          const handleClick = () => {
            if (isDisabled) return;
            onChange(item.value);
          };

          return (
            <button
              key={item.value}
              type="button"
              onClick={handleClick}
              disabled={isDisabled}
              className={[
                'px-3 py-2 text-sm font-medium rounded-t-md transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isActive
                  ? 'bg-[var(--color-surface)] text-[var(--color-foreground)] border border-b-0 border-[var(--color-border)]'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]',
              ].join(' ')}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div>{active?.content}</div>
    </div>
  );
}

