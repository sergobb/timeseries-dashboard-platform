'use client';

import { useTheme } from './providers/ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes: { value: 'light' | 'dark' | 'light-blue' | 'dark-blue'; label: string; icon: string }[] = [
    { value: 'light', label: 'Светлая', icon: '☀️' },
    { value: 'light-blue', label: 'Светло-голубая', icon: '🟦' },
    { value: 'dark', label: 'Тёмная', icon: '🌙' },
    { value: 'dark-blue', label: 'Тёмно-голубая', icon: '🌌' },
  ];

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`
              flex items-center justify-center px-2.5 py-1.5 rounded-md text-base transition-colors
              ${
                theme === t.value
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }
            `}
            title={t.label}
            aria-label={t.label}
          >
            <span>{t.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

