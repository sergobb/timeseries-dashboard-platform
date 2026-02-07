'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from './providers/ThemeProvider';
import { ChevronDownIcon, SunIcon, MoonIcon } from './ui/icons';

type Theme = 'light' | 'dark' | 'light-blue' | 'dark-blue';

const themes: { value: Theme; label: string; iconBg: 'default' | 'light-blue' | 'dark' | 'dark-blue'; Icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Light', iconBg: 'default', Icon: SunIcon },
  { value: 'light-blue', label: 'Light Blue', iconBg: 'light-blue', Icon: SunIcon },
  { value: 'dark', label: 'Dark', iconBg: 'dark', Icon: MoonIcon },
  { value: 'dark-blue', label: 'Dark Blue', iconBg: 'dark-blue', Icon: MoonIcon },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentTheme = themes.find((t) => t.value === theme) ?? themes[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (t: Theme) => {
    setTheme(t);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Выбрать тему"
      >
        <span
          className={`flex items-center justify-center w-6 h-6 rounded-md shrink-0 text-yellow-400 ${
            currentTheme.iconBg === 'light-blue'
              ? 'bg-[var(--theme-preview-light-blue)]'
              : currentTheme.iconBg === 'dark'
                ? 'bg-[var(--theme-preview-dark)]'
                : currentTheme.iconBg === 'dark-blue'
                  ? 'bg-[var(--theme-preview-dark-blue)]'
                  : 'bg-[var(--color-muted)]'
          }`}
        >
          <currentTheme.Icon className="w-3.5 h-3.5" />
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg py-1"
          role="listbox"
        >
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => handleSelect(t.value)}
              role="option"
              aria-selected={theme === t.value}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors
                ${theme === t.value ? 'bg-[var(--color-surface-muted)]' : 'hover:bg-[var(--color-surface-muted)]'}
              `}
            >
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 text-yellow-400 ${
                  t.iconBg === 'light-blue'
                    ? 'bg-[var(--theme-preview-light-blue)]'
                    : t.iconBg === 'dark'
                      ? 'bg-[var(--theme-preview-dark)]'
                      : t.iconBg === 'dark-blue'
                        ? 'bg-[var(--theme-preview-dark-blue)]'
                        : 'bg-[var(--color-muted)]'
                }`}
              >
                <t.Icon className="w-4 h-4" />
              </span>
              <span className={theme === t.value ? 'font-medium text-[var(--color-foreground)]' : 'text-[var(--color-muted-foreground)]'}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
