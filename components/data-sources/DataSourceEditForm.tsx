import { ColumnMetadata } from '@/types/metadata';
import Label from '@/components/ui/Label';
import Textarea from '@/components/ui/Textarea';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import FileInput from '@/components/ui/FileInput';
import Text from '@/components/ui/Text';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Box from '@/components/ui/Box';
import Flex from '@/components/ui/Flex';
import Scrollable from '@/components/ui/Scrollable';
import ColumnCard from '@/components/ui/ColumnCard';
import Divider from '@/components/ui/Divider';

interface DataSourceEditFormProps {
  description: string;
  columns: ColumnMetadata[];
  uploading: boolean;
  saving: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  error: string | null;
  onDescriptionChange: (value: string) => void;
  onColumnToggle: (index: number) => void;
  onColumnDescriptionChange: (index: number, description: string) => void;
  onFileUpload: (file: File) => Promise<void>;
  onSave: () => void;
  onCancel: () => void;
}

export default function DataSourceEditForm({
  description,
  columns,
  uploading,
  saving,
  fileInputRef,
  error,
  onDescriptionChange,
  onColumnToggle,
  onColumnDescriptionChange,
  onFileUpload,
  onSave,
  onCancel,
}: DataSourceEditFormProps) {
  const activeColumnsCount = columns.filter(col => col.active !== false).length;
  const inactiveColumnsCount = columns.length - activeColumnsCount;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  return (
    <Card className="p-6 space-y-6">
      <Box>
        <Label className="mb-2">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          placeholder="Enter description for this data source..."
        />
      </Box>

      <Box>
        <Flex justify="between" align="center" className="mb-4">
          <Label>
            Columns ({activeColumnsCount} active, {inactiveColumnsCount} inactive)
          </Label>
          <FileInput
            ref={fileInputRef}
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            label={uploading ? 'Загрузка...' : 'Загрузить описания из файла'}
            disabled={uploading}
          />
        </Flex>
        {error && !error.includes('Не найдено совпадений') && (
          <Text variant="error" size="sm" className="mb-4">
            {error}
          </Text>
        )}
        {error && error.includes('Не найдено совпадений') && (
          <Text variant="warning" size="sm" className="mb-4">
            {error}
          </Text>
        )}
        <Scrollable maxHeight="24rem">
          {columns.map((column, index) => (
            <ColumnCard key={index} active={column.active !== false}>
              <Flex align="start" gap="4">
                <Flex align="center" className="pt-1">
                  <Checkbox
                    checked={column.active !== false}
                    onChange={() => onColumnToggle(index)}
                  />
                </Flex>
                <Box className="flex-1">
                  <Flex align="center" gap="2" className="mb-2">
                    <Text className="font-medium">{column.columnName}</Text>
                    <Badge variant="default">{column.dataType}</Badge>
                    {column.active === false && (
                      <Badge variant="error">Inactive</Badge>
                    )}
                  </Flex>
                  <Textarea
                    value={column.description || ''}
                    onChange={(e) => onColumnDescriptionChange(index, e.target.value)}
                    rows={2}
                    placeholder="Column description..."
                  />
                </Box>
              </Flex>
            </ColumnCard>
          ))}
        </Scrollable>
      </Box>

      <Box>
        <Divider className="mb-4" />
        <Flex justify="end" gap="4">
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Flex>
      </Box>
    </Card>
  );
}
