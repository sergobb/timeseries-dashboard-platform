import { DatabaseType } from '@/types/database';
import { DatabaseConnectionFormData } from '@/hooks/useDatabaseConnection';
import ErrorMessage from '@/components/ErrorMessage';
import Card from '@/components/ui/Card';
import Box from '@/components/ui/Box';
import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Text from '@/components/ui/Text';
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

        <Box>
          <Label className="mb-2">Name</Label>
          <Input
            type="text"
            required
            value={formData.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
          />
        </Box>

        <Box>
          <Label className="mb-2">Type</Label>
          <Select
            value={formData.type}
            onChange={(e) => onFieldChange('type', e.target.value as DatabaseType)}
            disabled={isEdit}
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="clickhouse">ClickHouse</option>
          </Select>
          {isEdit && (
            <Text size="sm" variant="muted" className="mt-1">
              Type cannot be changed after creation
            </Text>
          )}
        </Box>

        <Box>
          <Label className="mb-2">Host</Label>
          <Input
            type="text"
            required
            value={formData.host}
            onChange={(e) => onFieldChange('host', e.target.value)}
          />
        </Box>

        <Box>
          <Label className="mb-2">Port</Label>
          <Input
            type="number"
            required
            value={formData.port}
            onChange={(e) => onFieldChange('port', parseInt(e.target.value))}
          />
        </Box>

        <Box>
          <Label className="mb-2">Database</Label>
          <Input
            type="text"
            required
            value={formData.database}
            onChange={(e) => onFieldChange('database', e.target.value)}
          />
        </Box>

        <Box>
          <Label className="mb-2">Username</Label>
          <Input
            type="text"
            required
            value={formData.username}
            onChange={(e) => onFieldChange('username', e.target.value)}
          />
        </Box>

        <Box>
          <Label className="mb-2">
            {isEdit ? 'Password (leave empty to keep current)' : 'Password'}
          </Label>
          <Input
            type="password"
            required={!isEdit}
            value={formData.password}
            onChange={(e) => onFieldChange('password', e.target.value)}
          />
        </Box>

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
