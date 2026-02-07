'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
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
  return (
    <TabsPrimitive.Root value={value} onValueChange={onChange} className="space-y-4">
      <TabsPrimitive.List className="flex flex-wrap gap-2 border-b border-[var(--color-border)]">
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={[
              'px-3 py-2 text-sm font-medium rounded-t-md transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'data-[state=active]:bg-[var(--color-surface)] data-[state=active]:text-[var(--color-foreground)] data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:border-[var(--color-border)]',
              'data-[state=inactive]:text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]',
            ].join(' ')}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content key={item.value} value={item.value}>
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
