import { Group } from '@/types/group';
import ErrorMessage from '@/components/ErrorMessage';
import Input from '@/components/ui/Input';
import Text from '@/components/ui/Text';
import Box from '@/components/ui/Box';
import Flex from '@/components/ui/Flex';
import IconButton from '@/components/ui/IconButton';
import Badge from '@/components/ui/Badge';
import { DeleteIcon, EditIcon } from '@/components/ui/icons';
import GroupCard from '@/components/groups/GroupCard';
import GroupGrid from '@/components/groups/GroupGrid';

interface GroupsContentProps {
  groups: Group[];
  filteredGroups: Group[];
  filterText: string;
  error: string | null;
  onFilterChange: (text: string) => void;
  onEdit: (groupId: string) => void;
  onDelete: (groupId: string, name: string) => void;
}

const roleLabel = (role: Group['role']) => {
  return role === 'edit' ? 'View & edit' : 'View only';
};

export default function GroupsContent({
  groups,
  filteredGroups,
  filterText,
  error,
  onFilterChange,
  onEdit,
  onDelete,
}: GroupsContentProps) {
  const createEditHandler = (groupId: string) => () => onEdit(groupId);
  const createDeleteHandler = (groupId: string, name: string) => () => onDelete(groupId, name);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {error && <ErrorMessage message={error} className="mb-4" />}

      <Box className="mb-6">
        <Input
          type="text"
          placeholder="Filter by name or description..."
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
        />
      </Box>

      <div className="flex-1 overflow-y-auto min-h-0">
        {groups.length === 0 ? (
          <Box className="text-center py-12">
            <Text variant="muted" className="mb-4">
              No groups found. Create your first group to get started.
            </Text>
          </Box>
        ) : filteredGroups.length === 0 ? (
          <Box className="text-center py-12">
            <Text variant="muted">No groups match the filter.</Text>
          </Box>
        ) : (
          <GroupGrid>
            {filteredGroups.map((group) => (
              <GroupCard key={group.id}>
                <Text className="text-xl font-semibold mb-2">{group.name}</Text>
                <Text variant="muted" className="mb-4">
                  {group.description}
                </Text>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={group.role === 'edit' ? 'success' : 'info'}>
                    {roleLabel(group.role)}
                  </Badge>
                  <Badge variant="default">{group.memberIds.length} members</Badge>
                </div>
                <Flex gap="2">
                  <IconButton
                    onClick={createEditHandler(group.id)}
                    variant="success"
                    icon={<EditIcon className="w-4 h-4" />}
                    tooltip="Edit"
                  />
                  <IconButton
                    onClick={createDeleteHandler(group.id, group.name)}
                    variant="danger"
                    icon={<DeleteIcon className="w-4 h-4" />}
                    tooltip="Delete"
                  />
                </Flex>
              </GroupCard>
            ))}
          </GroupGrid>
        )}
      </div>
    </div>
  );
}
