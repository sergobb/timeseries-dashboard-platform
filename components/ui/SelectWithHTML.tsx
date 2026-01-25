'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

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

export default function SelectWithHTML({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className = '',
}: SelectWithHTMLProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const baseClasses =
    'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-foreground)] shadow-sm focus:border-[var(--color-ring)] focus:outline-none focus:ring-[var(--color-ring)]';
  const classes = `${baseClasses} ${className}`.trim();

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        id={id}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`${classes} flex items-center justify-between cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span className="flex-1 text-left">
          {selectedOption ? (
            <span dangerouslySetInnerHTML={{ __html: String(selectedOption.label) }} />
          ) : (
            <span className="text-[var(--color-muted-foreground)]">{placeholder}</span>
          )}
        </span>
        <svg
          className={`ml-2 h-4 w-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-md shadow-xl max-h-60 overflow-auto">
          {options.filter((opt) => opt.value !== '').length === 0 ? (
            <div className="px-3 py-2 text-sm text-[var(--color-muted-foreground)] font-medium">
              No options available
            </div>
          ) : (
            options
              .filter((opt) => opt.value !== '')
              .map((option, index, array) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (!option.disabled) {
                      onChange(option.value);
                      setIsOpen(false);
                    }
                  }}
                  disabled={option.disabled}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                    option.value === value
                      ? 'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] font-semibold border-l-4 border-[var(--color-primary)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-foreground)]'
                  } ${
                    !option.disabled
                      ? 'hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)] cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  } ${
                    index < array.length - 1 ? 'border-b border-[var(--color-border)]' : ''
                  }`}
                >
                  <span dangerouslySetInnerHTML={{ __html: String(option.label) }} />
                </button>
              ))
          )}
        </div>
      )}
    </div>
  );
}

