import { DataSet } from '@/types/data-set';
import { Tag } from '@/types/tag';
import ErrorMessage from '@/components/ErrorMessage';
import IconButton from '@/components/ui/IconButton';
import { EditIcon, DeleteIcon } from '@/components/ui/icons';
import Input from '@/components/ui/Input';
import Text from '@/components/ui/Text';
import Box from '@/components/ui/Box';
import Flex from '@/components/ui/Flex';
import EmptyState from '@/components/ui/EmptyState';
import DataSetCard from './DataSetCard';
import DataSetGrid from './DataSetGrid';
import TagFilter from '@/components/common/TagFilter';
import Badge from '@/components/ui/Badge';

interface DataSetsContentProps {
  dataSets: DataSet[];
  filteredDataSets: DataSet[];
  filterText: string;
  tags: Tag[];
  tagsLoading: boolean;
  filterTagIds: string[];
  onFilterTagToggle: (tagId: string) => void;
  error: string | null;
  onFilterChange: (text: string) => void;
  onEdit: (dataSetId: string) => void;
  onDelete: (dataSetId: string, description?: string) => void;
  onCreateNew?: () => void;
}

export default function DataSetsContent({
  dataSets,
  filteredDataSets,
  filterText,
  tags,
  tagsLoading,
  filterTagIds,
  onFilterTagToggle,
  error,
  onFilterChange,
  onEdit,
  onDelete,
  onCreateNew,
}: DataSetsContentProps) {
  return (
    <>
      {error && <ErrorMessage message={error} className="mb-4" />}

      <Box className="mb-4">
        <Input
          type="text"
          placeholder="Filter by description..."
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

      {dataSets.length === 0 ? (
        <EmptyState
          title="No data sets yet"
          description="Create your first data set from data sources."
          actionLabel="New Data Set"
          onAction={onCreateNew}
        />
      ) : filteredDataSets.length === 0 ? (
        <EmptyState
          title="No data sets match the filter"
          description="Try a different search or clear the filter."
        />
      ) : (
        <DataSetGrid>
            {filteredDataSets.map((dataSet) => (
            <DataSetCard key={dataSet.id}>
              {dataSet.tagIds && dataSet.tagIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {tags
                    .filter((t) => dataSet.tagIds?.includes(t.id))
                    .map((t) => (
                      <Badge key={t.id} variant="info">
                        {t.name}
                      </Badge>
                    ))}
                </div>
              )}
              {dataSet.description && (
                <Text variant="muted" className="mb-4 block whitespace-pre-wrap">
                  {dataSet.description}
                </Text>
              )}
              <Flex gap="2">
                <IconButton
                  onClick={() => onEdit(dataSet.id)}
                  variant="success"
                  icon={<EditIcon className="w-4 h-4" />}
                  tooltip="Edit"
                />
                <IconButton
                  onClick={() => onDelete(dataSet.id, dataSet.description)}
                  variant="danger"
                  icon={<DeleteIcon className="w-4 h-4" />}
                  tooltip="Delete"
                />
              </Flex>
            </DataSetCard>
          ))}
        </DataSetGrid>
      )}
    </>
  );
}
