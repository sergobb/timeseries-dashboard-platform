import { ReactNode } from 'react';
import Card from '@/components/ui/Card';

interface DataSourceCardProps {
  children: ReactNode;
  className?: string;
}

export default function DataSourceCard({ children, className = '' }: DataSourceCardProps) {
  return (
    <Card variant="interactive" className={`p-6 ${className}`.trim()}>
      {children}
    </Card>
  );
}

