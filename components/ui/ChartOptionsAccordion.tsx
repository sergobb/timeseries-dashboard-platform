'use client';

import * as Collapsible from '@radix-ui/react-collapsible';
import { ReactNode } from 'react';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import { ChevronDownIcon } from '@/components/ui/icons';

interface ChartOptionsAccordionProps {
  title: string;
  children: ReactNode;
}

export default function ChartOptionsAccordion({
  title,
  children,
}: ChartOptionsAccordionProps) {
  return (
    <Collapsible.Root className="group">
      <Card className="bg-[var(--color-surface-muted)] overflow-hidden rounded-md">
        <Collapsible.Trigger className="w-full p-4 flex justify-between items-center cursor-pointer hover:bg-[var(--color-surface)] transition-colors text-left">
          <div className="flex items-center gap-2">
            <ChevronDownIcon className="w-4 h-4 text-[var(--color-muted-foreground)] transition-transform group-data-[state=open]:rotate-180 shrink-0" />
            <Text size="sm" className="font-semibold">
              {title}
            </Text>
          </div>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <div className="px-4 pb-4 pt-0">{children}</div>
        </Collapsible.Content>
      </Card>
    </Collapsible.Root>
  );
}
