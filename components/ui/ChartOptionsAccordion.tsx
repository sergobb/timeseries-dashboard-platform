'use client';

import { ReactNode, useState } from 'react';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/ui/icons';

interface ChartOptionsAccordionProps {
  title: string;
  children: ReactNode;
}

export default function ChartOptionsAccordion({
  title,
  children,
}: ChartOptionsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Card className="bg-[var(--color-surface-muted)]">
      <div
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-[var(--color-surface)] transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUpIcon className="w-4 h-4 text-[var(--color-muted-foreground)]" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-[var(--color-muted-foreground)]" />
          )}
          <Text size="sm" className="font-semibold">
            {title}
          </Text>
        </div>
      </div>

      {isOpen && <div className="px-4 pb-4 pt-0">{children}</div>}
    </Card>
  );
}

