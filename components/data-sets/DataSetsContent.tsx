import { useRouter } from 'next/navigation';
import { DataSet } from '@/types/data-set';
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

interface DataSetsContentProps {
  dataSets: DataSet[];
  filteredDataSets: DataSet[];
  filterText: string;
  error: string | null;
  onFilterChange: (text: string) => void;
  onDelete: (dataSetId: string, description?: string) => void;
}

export default function DataSetsContent({
  dataSets,
  filteredDataSets,
  filterText,
  error,
  onFilterChange,
  onDelete,
}: DataSetsContentProps) {
  const router = useRouter();

  return (
    <>
      {error && <ErrorMessage message={error} className="mb-4" />}

      <Box className="mb-6">
        <Input
          type="text"
          placeholder="Filter by description..."
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
        />
      </Box>

      {dataSets.length === 0 ? (
        <EmptyState
          title="No data sets yet"
          description="Create your first data set from data sources."
          actionLabel="New Data Set"
          onAction={() => router.push('/data-sets/new')}
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
              {dataSet.description && (
                <Text variant="muted" className="mb-4 block">
                  {dataSet.description}
                </Text>
              )}
              <Flex gap="2">
                <IconButton
                  onClick={() => router.push(`/data-sets/${dataSet.id}/edit`)}
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
