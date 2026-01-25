import { UserRole } from '@/types/auth';
import { UserWithRolesState } from '@/hooks/useUserRoles';
import ErrorMessage from '@/components/ErrorMessage';
import Text from '@/components/ui/Text';
import Box from '@/components/ui/Box';
import Card from '@/components/ui/Card';
import Checkbox from '@/components/ui/Checkbox';

interface UsersContentProps {
  users: UserWithRolesState[];
  availableRoles: UserRole[];
  error: string | null;
  onToggleRole: (userId: string, role: UserRole) => void;
}

const roleLabels: Record<UserRole, string> = {
  db_admin: 'DB admin',
  metadata_editor: 'Metadata editor',
  dashboard_creator: 'Dashboard creator',
  public: 'Public',
  user_admin: 'User admin',
};

export default function UsersContent({
  users,
  availableRoles,
  error,
  onToggleRole,
}: UsersContentProps) {
  const createToggleHandler = (userId: string, role: UserRole) => () => {
    onToggleRole(userId, role);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {error && <ErrorMessage message={error} className="mb-4" />}

      <div className="flex-1 overflow-y-auto min-h-0">
        {users.length === 0 ? (
          <Box className="text-center py-12">
            <Text variant="muted">No users found.</Text>
          </Box>
        ) : (
          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.id} className="p-6 h-full flex flex-col">
                <Box className="mb-4">
                  <Text className="text-lg font-semibold">
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text variant="muted">{user.email}</Text>
                </Box>

                <div className="space-y-2">
                  {availableRoles.map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-2 text-sm text-[var(--color-foreground)]"
                    >
                      <Checkbox
                        checked={user.roles.includes(role)}
                        onChange={createToggleHandler(user.id, role)}
                      />
                      <span>{roleLabels[role]}</span>
                    </label>
                  ))}
                </div>
              </Card>
            ))}
          </Box>
        )}
      </div>
    </div>
  );
}
