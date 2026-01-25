'use client';

import { useMemo, type ChangeEvent } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import PageTitle from '@/components/ui/PageTitle';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Text from '@/components/ui/Text';
import Box from '@/components/ui/Box';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import IconButton from '@/components/ui/IconButton';
import InfoMessage from '@/components/ui/InfoMessage';
import ErrorMessage from '@/components/ErrorMessage';
import { CloseIcon, PlusIcon, DeleteIcon } from '@/components/ui/icons';
import { GroupRole } from '@/types/group';
import { UserSummary } from '@/hooks/useUsers';

interface GroupFormProps {
  title: string;
  name: string;
  description: string;
  role: GroupRole;
  ownerId: string | null;
  userFilter: string;
  selectedUsers: UserSummary[];
  availableUsers: UserSummary[];
  saving: boolean;
  error: string | null;
  usersError: string | null;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onRoleChange: (value: GroupRole) => void;
  onUserFilterChange: (value: string) => void;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const formatUserName = (user: UserSummary) => {
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  if (fullName) return fullName;
  return user.email;
};

export default function GroupForm({
  title,
  name,
  description,
  role,
  ownerId,
  userFilter,
  selectedUsers,
  availableUsers,
  saving,
  error,
  usersError,
  onNameChange,
  onDescriptionChange,
  onRoleChange,
  onUserFilterChange,
  onAddMember,
  onRemoveMember,
  onSave,
  onCancel,
}: GroupFormProps) {
  const handleRoleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onRoleChange(event.target.value as GroupRole);
  };

  const userCounts = useMemo(() => {
    return {
      selected: selectedUsers.length,
      available: availableUsers.length,
    };
  }, [availableUsers.length, selectedUsers.length]);

  const createAddHandler = (userId: string) => () => onAddMember(userId);
  const createRemoveHandler = (userId: string) => () => onRemoveMember(userId);
  const isOwner = (userId: string) => Boolean(ownerId && userId === ownerId);

  return (
    <Box className="flex flex-col gap-6">
      <PageHeader
        title={<PageTitle>{title}</PageTitle>}
      />
      {error && <ErrorMessage message={error} />}
      {usersError && <ErrorMessage message={usersError} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <Box className="space-y-4">
          <div>
            <Text className="text-sm font-medium mb-2">Group name</Text>
            <Input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Marketing team"
            />
          </div>
          <div>
            <Text className="text-sm font-medium mb-2">Description</Text>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe what this group is for..."
            />
          </div>
          <div>
            <Text className="text-sm font-medium mb-2">Dashboard access</Text>
            <Select value={role} onChange={handleRoleChange}>
              <option value="view">View only</option>
              <option value="edit">View & edit</option>
            </Select>
          </div>
        </Box>

        <Box className="space-y-4">
          <div>
            <Text className="text-sm font-medium mb-2">
              Group members ({userCounts.selected})
            </Text>
            {selectedUsers.length === 0 ? (
              <InfoMessage message="No members added yet." />
            ) : (
              <div className="space-y-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-md border border-[var(--color-border)]"
                  >
                    <div>
                      <Text className="text-sm font-medium">{formatUserName(user)}</Text>
                      <Text size="sm" variant="muted">
                        {user.email}
                      </Text>
                    </div>
                    {!isOwner(user.id) && (
                      <IconButton
                        onClick={createRemoveHandler(user.id)}
                        variant="danger"
                        icon={<DeleteIcon className="w-4 h-4" />}
                        tooltip="Remove"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Text className="text-sm font-medium mb-2">
              Add users ({userCounts.available})
            </Text>
            <Input
              type="text"
              value={userFilter}
              onChange={(e) => onUserFilterChange(e.target.value)}
              placeholder="Filter users..."
              className="mb-3"
            />
            {availableUsers.length === 0 ? (
              <InfoMessage message="No users match the filter." />
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {availableUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-md border border-[var(--color-border)]"
                  >
                    <div>
                      <Text className="text-sm font-medium">{formatUserName(user)}</Text>
                      <Text size="sm" variant="muted">
                        {user.email}
                      </Text>
                    </div>
                    <IconButton
                      onClick={createAddHandler(user.id)}
                      variant="success"
                      icon={<PlusIcon className="w-4 h-4" />}
                      tooltip="Add"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Box>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save group'}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </Box>
  );
}
