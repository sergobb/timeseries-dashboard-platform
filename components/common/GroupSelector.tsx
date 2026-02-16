'use client';

import { useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Group } from '@/types/group';
import Label from '@/components/ui/Label';
import Badge from '@/components/ui/Badge';
import Box from '@/components/ui/Box';

interface GroupSelectorProps {
  groups: Group[];
  loading: boolean;
  selectedGroupIds: string[];
  onAddGroup: (groupId: string) => void;
  onRemoveGroup: (groupId: string) => void;
  error?: string | null;
}

export default function GroupSelector({
  groups,
  loading,
  selectedGroupIds,
  onAddGroup,
  onRemoveGroup,
  error,
}: GroupSelectorProps) {
  const selectedGroups = useMemo(
    () => groups.filter((g) => selectedGroupIds.includes(g.id)),
    [groups, selectedGroupIds]
  );

  const availableGroups = useMemo(
    () => groups.filter((g) => !selectedGroupIds.includes(g.id)),
    [groups, selectedGroupIds]
  );

  return (
    <Box>
      <Label className="mb-1.5 block">Shared with groups</Label>
      <div className="space-y-2">
        {selectedGroups.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedGroups.map((g) => (
              <Badge
                key={g.id}
                variant="info"
                className="group cursor-default pr-1"
              >
                {g.name}
                <button
                  type="button"
                  onClick={() => onRemoveGroup(g.id)}
                  className="ml-1 rounded hover:bg-[var(--color-muted)] p-0.5"
                  aria-label={`Remove ${g.name}`}
                >
                  <span className="text-[10px] leading-none">×</span>
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <Popover.Root>
            <Popover.Trigger
              type="button"
              disabled={loading || availableGroups.length === 0}
              className="text-sm px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-input)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading…' : 'Select groups…'}
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="start"
                sideOffset={4}
                className="z-50 max-h-48 w-[min(45rem,90vw)] min-w-[min(100%,20rem)] overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg p-2"
              >
                <div className="flex flex-wrap gap-1.5 max-w-full" style={{ maxWidth: 'min(40rem, 100%)' }}>
                  {availableGroups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => onAddGroup(g.id)}
                      className="inline-flex flex-col items-start px-2 py-1 rounded text-xs font-medium bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] border border-transparent hover:border-[var(--color-border)] text-left shrink-0"
                    >
                      <span className="font-medium">{g.name}</span>
                      {g.description && (
                        <span className="text-[10px] text-[var(--color-muted-foreground)] mt-0.5 line-clamp-1 max-w-[14rem]">
                          {g.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
        {error && (
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        )}
        {!loading && !error && groups.length === 0 && (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No groups yet. Create a group to share this dashboard.
          </p>
        )}
      </div>
    </Box>
  );
}
