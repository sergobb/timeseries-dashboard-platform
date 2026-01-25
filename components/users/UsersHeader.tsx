import PageHeader from '@/components/ui/PageHeader';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';

interface UsersHeaderProps {
  onSave: () => void;
  saving: boolean;
  disabled: boolean;
}

export default function UsersHeader({ onSave, saving, disabled }: UsersHeaderProps) {
  return (
    <PageHeader
      title={<PageTitle>User Roles</PageTitle>}
      action={
        <Button onClick={onSave} disabled={disabled || saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      }
    />
  );
}
