import { DatabaseType } from '@/types/database';
import { DatabaseConnectionFormData } from '@/hooks/useDatabaseConnection';
import ErrorMessage from '@/components/ErrorMessage';
import Card from '@/components/ui/Card';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Flex from '@/components/ui/Flex';

interface DatabaseConnectionFormProps {
  formData: DatabaseConnectionFormData;
  error: string | null;
  loading: boolean;
  isEdit?: boolean;
  onFieldChange: <K extends keyof DatabaseConnectionFormData>(
    field: K,
    value: DatabaseConnectionFormData[K]
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function DatabaseConnectionForm({
  formData,
  error,
  loading,
  isEdit = false,
  onFieldChange,
  onSubmit,
  onCancel,
}: DatabaseConnectionFormProps) {
  return (
    <Card className="p-6">
      <form onSubmit={onSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} />}

        <FormField label="Name" required>
          <Input
            type="text"
            required
            value={formData.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
          />
        </FormField>

        <FormField
          label="Type"
          hint={isEdit ? 'Type cannot be changed after creation' : undefined}
        >
          <Select
            value={formData.type}
            onChange={(e) => onFieldChange('type', e.target.value as DatabaseType)}
            disabled={isEdit}
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="clickhouse">ClickHouse</option>
          </Select>
        </FormField>

        <FormField label="Host" required>
          <Input
            type="text"
            required
            value={formData.host}
            onChange={(e) => onFieldChange('host', e.target.value)}
          />
        </FormField>

        <FormField label="Port" required>
          <Input
            type="number"
            required
            value={formData.port}
            onChange={(e) => onFieldChange('port', parseInt(e.target.value))}
          />
        </FormField>

        <FormField label="Database" required>
          <Input
            type="text"
            required
            value={formData.database}
            onChange={(e) => onFieldChange('database', e.target.value)}
          />
        </FormField>

        <FormField label="Username" required>
          <Input
            type="text"
            required
            value={formData.username}
            onChange={(e) => onFieldChange('username', e.target.value)}
          />
        </FormField>

        <FormField
          label={isEdit ? 'Password (leave empty to keep current)' : 'Password'}
          required={!isEdit}
        >
          <Input
            type="password"
            required={!isEdit}
            value={formData.password}
            onChange={(e) => onFieldChange('password', e.target.value)}
          />
        </FormField>

        <Flex gap="4">
          <Button type="submit" disabled={loading}>
            {loading
              ? isEdit
                ? 'Updating...'
                : 'Creating...'
              : isEdit
              ? 'Update Connection'
              : 'Create Connection'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </Flex>
      </form>
    </Card>
  );
}
