'use client';

import { ReactNode } from 'react';
import Card from '@/components/ui/Card';

interface ChartBuilderLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export default function ChartBuilderLayout({ leftPanel, rightPanel }: ChartBuilderLayoutProps) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6 min-w-0">
          {leftPanel}
        </div>
        <div className="space-y-6 min-w-0">
          <Card variant="muted" className="p-0 overflow-hidden">
            {rightPanel}
          </Card>
        </div>
      </div>
    </div>
  );
}

