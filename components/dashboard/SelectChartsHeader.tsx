'use client';

import PageHeader from '@/components/ui/PageHeader';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import Flex from '@/components/ui/Flex';

interface SelectChartsHeaderProps {
  selectedCount: number;
  saving: boolean;
  onCancel: () => void;
  onAddSelected: () => void;
}

export default function SelectChartsHeader({
  selectedCount,
  saving,
  onCancel,
  onAddSelected,
}: SelectChartsHeaderProps) {
  return (
    <PageHeader
      title={<PageTitle>Select Charts</PageTitle>}
      action={
        <Flex align="center" className="gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onAddSelected} disabled={selectedCount === 0 || saving}>
            {saving ? 'Adding...' : `Add Selected to Dashboard (${selectedCount})`}
          </Button>
        </Flex>
      }
    />
  );
}
