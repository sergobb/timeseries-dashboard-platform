'use client';

import { ReactNode } from 'react';

interface ChartBuilderLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export default function ChartBuilderLayout({ leftPanel, rightPanel }: ChartBuilderLayoutProps) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Левая панель - настройки */}
        <div className="space-y-6">{leftPanel}</div>

        {/* Правая панель - preview */}
        <div className="space-y-6">{rightPanel}</div>
      </div>
    </div>
  );
}

