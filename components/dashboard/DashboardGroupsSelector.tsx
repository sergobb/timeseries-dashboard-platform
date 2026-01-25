import Checkbox from '@/components/ui/Checkbox';
import Label from '@/components/ui/Label';
import Box from '@/components/ui/Box';
import InfoMessage from '@/components/ui/InfoMessage';
import ErrorMessage from '@/components/ErrorMessage';
import { Group } from '@/types/group';

interface DashboardGroupsSelectorProps {
  groups: Group[];
  selectedGroupIds: string[];
  loading: boolean;
  error: string | null;
  onToggle: (groupId: string) => void;
}

export default function DashboardGroupsSelector({
  groups,
  selectedGroupIds,
  loading,
  error,
  onToggle,
}: DashboardGroupsSelectorProps) {
  return (
    <Box>
      <Label htmlFor="dashboard-groups" className="mb-2">
        My Groups
      </Label>
      <div id="dashboard-groups" className="space-y-2">
        {loading && <InfoMessage message="Loading groups..." />}
        {!loading && error && <ErrorMessage message={error} />}
        {!loading && !error && groups.length === 0 && (
          <InfoMessage message="No groups yet. Create a group to share this dashboard." />
        )}
        {!loading && !error && groups.length > 0 && (
          <div className="space-y-2">
            {groups.map((group) => {
              const isSelected = selectedGroupIds.includes(group.id);

              return (
                <label
                  key={group.id}
                  className={`flex items-start gap-3 rounded-md border p-3 transition-colors ${
                    isSelected
                      ? 'border-[var(--color-accent)] bg-[var(--color-surface-muted)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-muted)]'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onToggle(group.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[var(--color-foreground)]">
                      {group.name}
                    </div>
                    {group.description && (
                      <div className="text-sm text-[var(--color-muted-foreground)] mt-1">
                        {group.description}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </Box>
  );
}
