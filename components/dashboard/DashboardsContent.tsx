import Link from 'next/link';
import { Dashboard } from '@/types/dashboard';
import { Tag } from '@/types/tag';
import ErrorMessage from '@/components/ErrorMessage';
import IconButton from '@/components/ui/IconButton';
import { EditIcon, DeleteIcon } from '@/components/ui/icons';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Box from '@/components/ui/Box';
import Flex from '@/components/ui/Flex';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import TagFilter from '@/components/common/TagFilter';
import Badge from '@/components/ui/Badge';

interface DashboardsContentProps {
  dashboards: Dashboard[];
  /** Уже отсортированный список для отображения (свои дашборды первыми) */
  displayDashboards: Dashboard[];
  filterText: string;
  tags: Tag[];
  tagsLoading: boolean;
  filterTagIds: string[];
  onFilterTagToggle: (tagId: string) => void;
  error: string | null;
  onFilterChange: (text: string) => void;
  onDelete: (dashboardId: string, title: string) => void;
  onEdit: (dashboardId: string) => void;
  onCreateNew?: () => void;
  canEdit: (dashboard: Dashboard) => boolean;
  isOwner: (dashboard: Dashboard) => boolean;
}

export default function DashboardsContent({
  dashboards,
  displayDashboards,
  filterText,
  tags,
  tagsLoading,
  filterTagIds,
  onFilterTagToggle,
  error,
  onFilterChange,
  onDelete,
  onEdit,
  onCreateNew,
  canEdit,
  isOwner,
}: DashboardsContentProps) {
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

      {dashboards.length === 0 ? (
        <EmptyState
          title="No dashboards yet"
          description="Create your first dashboard to start visualizing data."
          actionLabel="New Dashboard"
          onAction={onCreateNew}
        />
      ) : displayDashboards.length === 0 ? (
        <EmptyState
          title="No dashboards match the filter"
          description="Try a different search or clear the filter."
        />
      ) : (
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayDashboards.map((dashboard) => {
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
                  {dashboard.tagIds && dashboard.tagIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tags
                        .filter((t) => dashboard.tagIds?.includes(t.id))
                        .map((t) => (
                          <Badge key={t.id} variant="info">
                            {t.name}
                          </Badge>
                        ))}
                    </div>
                  )}
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
                        onEdit(dashboard.id);
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
