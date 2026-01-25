import { DataSource } from '@/types/data-source';
import ErrorMessage from '@/components/ErrorMessage';
import IconButton from '@/components/ui/IconButton';
import { EditIcon, DeleteIcon } from '@/components/ui/icons';
import Input from '@/components/ui/Input';
import Text from '@/components/ui/Text';
import Box from '@/components/ui/Box';
import Flex from '@/components/ui/Flex';
import DataSourceCard from './DataSourceCard';
import DataSourceGrid from './DataSourceGrid';

interface DataSourcesContentProps {
  dataSources: DataSource[];
  filteredDataSources: DataSource[];
  filterText: string;
  error: string | null;
  onFilterChange: (text: string) => void;
  onEdit: (dataSourceId: string) => void;
  onDelete: (dataSourceId: string, tableName: string) => void;
}

export default function DataSourcesContent({
  dataSources,
  filteredDataSources,
  filterText,
  error,
  onFilterChange,
  onEdit,
  onDelete,
}: DataSourcesContentProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {error && <ErrorMessage message={error} className="mb-4" />}

      <Box className="mb-6">
        <Input
          type="text"
          placeholder="Filter by schema, table name, or description..."
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
        />
      </Box>

      <div className="flex-1 overflow-y-auto min-h-0">
        {dataSources.length === 0 ? (
          <Box className="text-center py-12">
            <Text variant="muted" className="mb-4">
              No data sources found. Create your first data source to get started.
            </Text>
          </Box>
        ) : filteredDataSources.length === 0 ? (
          <Box className="text-center py-12">
            <Text variant="muted">
              No data sources match the filter.
            </Text>
          </Box>
        ) : (
          <DataSourceGrid>
            {filteredDataSources.map((dataSource) => (
              <DataSourceCard key={dataSource.id}>
                <Text className="text-xl font-semibold mb-2">
                  {dataSource.schemaName ? `${dataSource.schemaName}.` : ''}{dataSource.tableName}
                </Text>
                {dataSource.description && (
                  <Text variant="muted" className="mb-4">
                    {dataSource.description}
                  </Text>
                )}
                <Text size="sm" variant="muted" className="mb-4">
                  {dataSource.columns.length} column{dataSource.columns.length !== 1 ? 's' : ''}
                </Text>
                <Flex gap="2">
                  <IconButton
                    onClick={() => onEdit(dataSource.id)}
                    variant="success"
                    icon={<EditIcon className="w-4 h-4" />}
                    tooltip="Edit"
                  />
                  <IconButton
                    onClick={() => onDelete(dataSource.id, dataSource.tableName)}
                    variant="danger"
                    icon={<DeleteIcon className="w-4 h-4" />}
                    tooltip="Delete"
                  />
                </Flex>
              </DataSourceCard>
            ))}
          </DataSourceGrid>
        )}
      </div>
    </div>
  );
}
