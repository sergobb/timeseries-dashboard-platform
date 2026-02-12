import { ReactNode } from 'react';
import Card from '@/components/ui/Card';

interface DataSetCardProps {
  children: ReactNode;
  className?: string;
}

export default function DataSetCard({ children, className = '' }: DataSetCardProps) {
  return (
    <Card variant="interactive" className={`p-6 ${className}`.trim()}>
      {children}
    </Card>
  );
}

