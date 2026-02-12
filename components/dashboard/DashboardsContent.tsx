import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dashboard } from '@/types/dashboard';
import ErrorMessage from '@/components/ErrorMessage';
import IconButton from '@/components/ui/IconButton';
import { EditIcon, DeleteIcon } from '@/components/ui/icons';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Box from '@/components/ui/Box';
import Flex from '@/components/ui/Flex';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';

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

      {dashboards.length === 0 ? (
        <EmptyState
          title="No dashboards yet"
          description="Create your first dashboard to start visualizing data."
          actionLabel="New Dashboard"
          onAction={() => router.push('/dashboards/new')}
        />
      ) : sortedDashboards.length === 0 ? (
        <EmptyState
          title="No dashboards match the filter"
          description="Try a different search or clear the filter."
        />
      ) : (
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDashboards.map((dashboard) => {
            const chartCount = dashboard.chartIds?.length ?? 0;
            const updated = dashboard.updatedAt
              ? new Date(dashboard.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : null;
            return (
              <Card
                key={dashboard.id}
                variant="interactive"
                className="p-6 h-full flex flex-col"
              >
                <Link
                  href={`/dashboards/${dashboard.id}/view`}
                  className="flex-1 flex flex-col min-w-0"
                >
                  <Text className="font-display text-xl font-semibold mb-2 block">
                    {dashboard.title}
                  </Text>
                  {dashboard.description && (
                    <Text variant="muted" className="mb-3 line-clamp-2">
                      {dashboard.description}
                    </Text>
                  )}
                  <Flex gap="2" align="center" className="mt-auto">
                    <Text size="sm" variant="muted">
                      {chartCount} chart{chartCount !== 1 ? 's' : ''}
                    </Text>
                    {updated && (
                      <>
                        <Text size="sm" variant="muted">·</Text>
                        <Text size="sm" variant="muted">Updated {updated}</Text>
                      </>
                    )}
                  </Flex>
                </Link>
                <Flex gap="2" justify="end" className="mt-4 pt-4 border-t border-[var(--color-border-muted)]">
                  {canEdit(dashboard) && (
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/dashboards/${dashboard.id}/edit`);
                      }}
                      variant="secondary"
                      icon={<EditIcon className="w-4 h-4" />}
                      tooltip="Edit"
                    />
                  )}
                  {isOwner(dashboard) && (
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete(dashboard.id, dashboard.title);
                      }}
                      variant="danger"
                      icon={<DeleteIcon className="w-4 h-4" />}
                      tooltip="Delete"
                    />
                  )}
                </Flex>
              </Card>
            );
          })}
        </Box>
      )}
    </>
  );
}
