'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ReactNode } from 'react';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import { ChevronDownIcon } from '@/components/ui/icons';

interface AccordionElementProps {
  id: string;
  title: string;
  children: ReactNode;
  onRemove?: () => void;
}

export default function AccordionElement({
  id,
  title,
  children,
  onRemove,
}: AccordionElementProps) {
  return (
    <AccordionPrimitive.Item value={id} className="[&>div]:rounded-md">
      <Card className="bg-[var(--color-surface-muted)] overflow-hidden rounded-md border-0 shadow-none">
        <AccordionPrimitive.Header className="flex">
          <AccordionPrimitive.Trigger className="group flex-1 p-4 flex justify-between items-center cursor-pointer hover:bg-[var(--color-surface)] transition-colors text-left data-[state=open]:rounded-b-none">
            <div className="flex items-center gap-2">
              <ChevronDownIcon className="w-4 h-4 text-[var(--color-muted-foreground)] transition-transform group-data-[state=open]:rotate-180" />
              <Text size="sm" className="font-semibold">
                {title}
              </Text>
            </div>
            {onRemove && (
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onRemove();
                }}
              >
                Remove
              </Button>
            )}
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content>
          <div className="px-4 pb-4 pt-0">{children}</div>
        </AccordionPrimitive.Content>
      </Card>
    </AccordionPrimitive.Item>
  );
}
