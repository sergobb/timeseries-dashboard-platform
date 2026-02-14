import { useRouter } from 'next/navigation';
import { DataSource } from '@/types/data-source';
import { Tag } from '@/types/tag';
import ErrorMessage from '@/components/ErrorMessage';
import IconButton from '@/components/ui/IconButton';
import { EditIcon, DeleteIcon } from '@/components/ui/icons';
import Input from '@/components/ui/Input';
import Text from '@/components/ui/Text';
import Box from '@/components/ui/Box';
import Flex from '@/components/ui/Flex';
import EmptyState from '@/components/ui/EmptyState';
import DataSourceCard from './DataSourceCard';
import DataSourceGrid from './DataSourceGrid';
import TagFilter from '@/components/common/TagFilter';
import Badge from '@/components/ui/Badge';

interface DataSourcesContentProps {
  dataSources: DataSource[];
  filteredDataSources: DataSource[];
  filterText: string;
  tags: Tag[];
  tagsLoading: boolean;
  filterTagIds: string[];
  onFilterTagToggle: (tagId: string) => void;
  error: string | null;
  onFilterChange: (text: string) => void;
  onEdit: (dataSourceId: string) => void;
  onDelete: (dataSourceId: string, tableName: string) => void;
}

export default function DataSourcesContent({
  dataSources,
  filteredDataSources,
  filterText,
  tags,
  tagsLoading,
  filterTagIds,
  onFilterTagToggle,
  error,
  onFilterChange,
  onEdit,
  onDelete,
}: DataSourcesContentProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {error && <ErrorMessage message={error} className="mb-4" />}

      <Box className="mb-4">
        <Input
          type="text"
          placeholder="Filter by schema, table name, or description..."
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
        />
      </Box>
      {tags.length > 0 && (
        <Box className="mb-4">
          <TagFilter
            tags={tags}
            loading={tagsLoading}
            selectedTagIds={filterTagIds}
            onToggleTag={onFilterTagToggle}
          />
        </Box>
      )}

      <div className="flex-1 overflow-y-auto min-h-0">
        {dataSources.length === 0 ? (
          <EmptyState
            title="No data sources yet"
            description="Create your first data source from a database connection."
            actionLabel="New Data Source"
            onAction={() => router.push('/data-sources/new')}
          />
        ) : filteredDataSources.length === 0 ? (
          <EmptyState
            title="No data sources match the filter"
            description="Try a different search or clear the filter."
          />
        ) : (
          <DataSourceGrid>
            {filteredDataSources.map((dataSource) => (
              <DataSourceCard key={dataSource.id}>
                <Text className="font-display text-xl font-semibold mb-2 block">
                  {dataSource.schemaName ? `${dataSource.schemaName}.` : ''}{dataSource.tableName}
                </Text>
                {dataSource.tagIds && dataSource.tagIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tags
                      .filter((t) => dataSource.tagIds?.includes(t.id))
                      .map((t) => (
                        <Badge key={t.id} variant="info">
                          {t.name}
                        </Badge>
                      ))}
                  </div>
                )}
                {dataSource.description && (
                  <Text variant="muted" className="mb-4 whitespace-pre-wrap">
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
