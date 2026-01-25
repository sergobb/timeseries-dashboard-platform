'use client';

import { ReactNode, useState, createContext, useContext, useImperativeHandle, forwardRef, useEffect } from 'react';

interface AccordionContextType {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

export const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within AccordionContainer');
  }
  return context;
};

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
    const [internalActiveId, setInternalActiveId] = useState<string | null>(defaultActiveId);
    const activeId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId;

    useImperativeHandle(ref, () => ({
      setActiveId: (id: string | null) => {
        if (controlledActiveId === undefined) {
          setInternalActiveId(id);
        }
      },
    }));

    const setActiveId = (id: string | null) => {
      if (controlledActiveId === undefined) {
        setInternalActiveId(id);
      }
    };

    return (
      <AccordionContext.Provider value={{ activeId, setActiveId }}>
        <div className="space-y-4">{children}</div>
      </AccordionContext.Provider>
    );
  }
);

AccordionContainer.displayName = 'AccordionContainer';

export default AccordionContainer;

