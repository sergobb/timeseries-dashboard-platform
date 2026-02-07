'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { ReactNode, Children, isValidElement } from 'react';

const EMPTY_SENTINEL = '__radix_select_empty__';

interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  id?: string;
  value: string | number;
  onChange?: (e: { target: { value: string } }) => void;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

function parseOptionsFromChildren(children: ReactNode): SelectOption[] {
  const options: SelectOption[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === 'option') {
      const props = child.props as { value?: string; disabled?: boolean; children?: ReactNode };
      const rawValue = String(props.value ?? '');
      options.push({
        value: rawValue === '' ? EMPTY_SENTINEL : rawValue,
        label: props.children ?? props.value ?? '',
        disabled: props.disabled,
      });
    }
  });
  return options;
}

const triggerClasses =
  'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm focus:border-[var(--color-ring)] focus:outline-none focus:ring-[var(--color-ring)] flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed [&>span]:truncate';

const Select = ({ id, value, onChange, children, className = '', disabled }: SelectProps) => {
  const options = parseOptionsFromChildren(children);
  const strValue = String(value);
  const radixValue = strValue === '' ? EMPTY_SENTINEL : strValue;

  return (
    <SelectPrimitive.Root
      value={radixValue}
      onValueChange={(v) => onChange?.({ target: { value: v === EMPTY_SENTINEL ? '' : v } })}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        id={id}
        className={`${triggerClasses} ${className}`.trim()}
      >
        <SelectPrimitive.Value placeholder="Select..." />
        <SelectPrimitive.Icon>
          <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-60 min-w-[8rem] overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((opt, i) => (
              <SelectPrimitive.Item
                key={opt.value === EMPTY_SENTINEL ? `empty-${i}` : opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none data-[highlighted]:bg-[var(--color-secondary)] data-[highlighted]:text-[var(--color-secondary-foreground)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

export default Select;
