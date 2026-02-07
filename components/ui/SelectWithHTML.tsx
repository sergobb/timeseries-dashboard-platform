'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { ReactNode } from 'react';

interface SelectOption {
  value: string;
  label: string | ReactNode;
  disabled?: boolean;
}

interface SelectWithHTMLProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const triggerClasses =
  'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm focus:border-[var(--color-ring)] focus:outline-none focus:ring-[var(--color-ring)] flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed';

export default function SelectWithHTML({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className = '',
}: SelectWithHTMLProps) {
  const filteredOptions = options.filter((opt) => opt.value !== '');

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        id={id}
        className={`${triggerClasses} ${className}`.trim()}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <svg
            className="ml-2 h-4 w-4 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-60 w-full min-w-[8rem] overflow-hidden rounded-md border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
        >
          <SelectPrimitive.Viewport className="p-0">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[var(--color-muted-foreground)] font-medium">
                No options available
              </div>
            ) : (
              filteredOptions.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={`relative flex cursor-pointer select-none items-center rounded-none px-3 py-2.5 text-sm outline-none ${
                    option.value === value
                      ? 'bg-[var(--color-secondary)] font-semibold text-[var(--color-secondary-foreground)] border-l-4 border-[var(--color-primary)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-foreground)]'
                  } ${
                    !option.disabled
                      ? 'hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)] data-[highlighted]:bg-[var(--color-secondary)] data-[highlighted]:text-[var(--color-foreground)]'
                      : 'opacity-50 cursor-not-allowed'
                  } border-b border-[var(--color-border)] last:border-b-0`}
                >
                  <SelectPrimitive.ItemText>
                    {typeof option.label === 'string' && option.label.includes('<') ? (
                      <span dangerouslySetInnerHTML={{ __html: option.label }} />
                    ) : (
                      option.label
                    )}
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
