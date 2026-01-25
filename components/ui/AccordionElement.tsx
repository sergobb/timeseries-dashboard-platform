'use client';

import { ReactNode } from 'react';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/ui/icons';
import { useAccordion } from './AccordionContainer';

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
  const { activeId, setActiveId } = useAccordion();
  const isOpen = activeId === id;

  const handleToggle = () => {
    setActiveId(isOpen ? null : id);
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
        <div className="flex items-center gap-2">
          {onRemove && (
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      {isOpen && <div className="px-4 pb-4 pt-0">{children}</div>}
    </Card>
  );
}

