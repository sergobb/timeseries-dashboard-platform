'use client';

import { useEffect } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Theme } from '@/components/providers/ThemeProvider';

export default function PublicThemeFromUrl({
  themeFromUrl,
  children,
}: {
  themeFromUrl: Theme | null;
  children: React.ReactNode;
}) {
  const { setThemeOverride } = useTheme();

  useEffect(() => {
    setThemeOverride(themeFromUrl);
    return () => setThemeOverride(null);
  }, [themeFromUrl, setThemeOverride]);

  return <>{children}</>;
}
