'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { forwardRef, ReactNode, useImperativeHandle, useRef, useState } from 'react';

export interface AccordionContainerRef {
  setActiveId: (id: string | null) => void;
}

interface AccordionContainerProps {
  children: ReactNode;
  defaultActiveId?: string | null;
  activeId?: string | null;
}

const AccordionContainer = forwardRef<AccordionContainerRef, AccordionContainerProps>(
  ({ children, defaultActiveId = null, activeId: controlledActiveId }, ref) => {
    const [internalValue, setInternalValue] = useState<string | undefined>(
      defaultActiveId ?? undefined
    );
    const value =
      controlledActiveId !== undefined
        ? controlledActiveId ?? undefined
        : internalValue;

    useImperativeHandle(ref, () => ({
      setActiveId: (id: string | null) => {
        if (controlledActiveId === undefined) {
          setInternalValue(id ?? undefined);
        }
      },
    }));

    return (
      <AccordionPrimitive.Root
        type="single"
        collapsible
        value={value ?? ''}
        onValueChange={(v) => {
          if (controlledActiveId === undefined) {
            setInternalValue(v || undefined);
          }
        }}
        className="space-y-4"
      >
        {children}
      </AccordionPrimitive.Root>
    );
  }
);

AccordionContainer.displayName = 'AccordionContainer';

export default AccordionContainer;
