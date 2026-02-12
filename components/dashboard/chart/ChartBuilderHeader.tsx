'use client';

import PageHeader from '@/components/ui/PageHeader';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import Flex from '@/components/ui/Flex';
import ErrorMessage from '@/components/ErrorMessage';

interface ChartBuilderHeaderProps {
  chartId: string | null;
  saving: boolean;
  hasSeries: boolean;
  onSave: () => void;
  onCancel: () => void;
  error: string;
}

export default function ChartBuilderHeader({
  chartId,
  saving,
  hasSeries,
  onSave,
  onCancel,
  error,
}: ChartBuilderHeaderProps) {
  return (
    <div className="flex-shrink-0">
      <PageHeader
        title={<PageTitle>{chartId ? 'Edit Chart' : 'New Chart'}</PageTitle>}
        action={
          <Flex gap="4">
            <Button onClick={onSave} disabled={!hasSeries || saving}>
              {saving ? (chartId ? 'Saving...' : 'Creating...') : (chartId ? 'Save Chart' : 'Create Chart')}
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </Flex>
        }
      />
      {error && <ErrorMessage message={error} className="mb-4" />}
    </div>
  );
}
