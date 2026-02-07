import { useRouter } from 'next/navigation';
import { Dashboard } from '@/types/dashboard';
import ErrorMessage from '@/components/ErrorMessage';
import IconButton from '@/components/ui/IconButton';
import { EyeIcon, EditIcon, DeleteIcon } from '@/components/ui/icons';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Box from '@/components/ui/Box';
import Flex from '@/components/ui/Flex';
import Input from '@/components/ui/Input';

interface DashboardsContentProps {
  dashboards: Dashboard[];
  filteredDashboards: Dashboard[];
  filterText: string;
  error: string | null;
  onFilterChange: (text: string) => void;
  onDelete: (dashboardId: string, title: string) => void;
  currentUserId?: string | null;
}

export default function DashboardsContent({
  dashboards,
  filteredDashboards,
  filterText,
  error,
  onFilterChange,
  onDelete,
  currentUserId,
}: DashboardsContentProps) {
  const router = useRouter();
  const isOwner = (dashboard: Dashboard) =>
    Boolean(currentUserId && dashboard.createdBy === currentUserId);
  const canEdit = (dashboard: Dashboard) =>
    isOwner(dashboard) || Boolean(dashboard.canEdit);
  const sortedDashboards = [...filteredDashboards].sort(
    (a, b) => Number(isOwner(b)) - Number(isOwner(a)),
  );

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

      {dashboards.length === 0 ? null : sortedDashboards.length === 0 ? (
        <Box className="text-center py-12">
          <Text variant="muted">No dashboards match the filter.</Text>
        </Box>
      ) : (
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedDashboards.map((dashboard) => (
          <Card
            key={dashboard.id}
            className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow"
          >
            <Box className="mb-4 flex-1">
              <Text className="text-xl font-semibold mb-2">
                {dashboard.title}
              </Text>
              {dashboard.description && (
                <Text variant="muted" className="mb-4">
                  {dashboard.description}
                </Text>
              )}
              <Flex gap="2" align="center" className="mb-4">
                <Text size="sm" variant="muted">
                  {dashboard.chartIds?.length || 0} chart{(dashboard.chartIds?.length || 0) !== 1 ? 's' : ''}
                </Text>
              </Flex>
            </Box>
            <Flex gap="2" justify="end" className="mt-auto">
              <IconButton
                onClick={() => router.push(`/dashboards/${dashboard.id}/view`)}
                variant="primary"
                icon={<EyeIcon className="w-4 h-4" />}
                tooltip="View"
              />
              {canEdit(dashboard) && (
                <>
                  <IconButton
                    onClick={() => router.push(`/dashboards/${dashboard.id}/edit`)}
                    variant="success"
                    icon={<EditIcon className="w-4 h-4" />}
                    tooltip="Edit"
                  />
                </>
              )}
              {isOwner(dashboard) && (
                <IconButton
                  onClick={() => onDelete(dashboard.id, dashboard.title)}
                  variant="danger"
                  icon={<DeleteIcon className="w-4 h-4" />}
                  tooltip="Delete"
                />
              )}
            </Flex>
          </Card>
        ))}
      </Box>
      )}
    </>
  );
}
