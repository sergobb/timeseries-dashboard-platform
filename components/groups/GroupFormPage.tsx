'use client';

import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import InfoMessage from '@/components/ui/InfoMessage';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import { useGroupEditor } from '@/hooks/useGroupEditor';
import GroupForm from '@/components/groups/GroupForm';

interface GroupFormPageProps {
  title: string;
  groupId?: string;
}

export default function GroupFormPage({ title, groupId }: GroupFormPageProps) {
  const router = useRouter();
  const { status } = useRequireAuthRedirect();
  const {
    name,
    description,
    role,
    ownerId,
    userFilter,
    selectedUsers,
    availableUsers,
    loading,
    saving,
    error,
    usersError,
    setName,
    setDescription,
    setRole,
    setUserFilter,
    addMember,
    removeMember,
    save,
  } = useGroupEditor(groupId);

  const goToGroups = () => {
    router.push('/groups');
  };

  if (status === 'unauthenticated') return null;

  if (status === 'loading' || loading) {
    return (
      <PageContainer innerClassName="max-w-7xl mx-auto">
        <InfoMessage message="Loading..." size="base" />
      </PageContainer>
    );
  }

  return (
    <PageContainer flex className="min-h-screen" innerClassName="max-w-7xl mx-auto h-full flex flex-col min-h-0">
      <GroupForm
        title={title}
        name={name}
        description={description}
        role={role}
        ownerId={ownerId}
        userFilter={userFilter}
        selectedUsers={selectedUsers}
        availableUsers={availableUsers}
        saving={saving}
        error={error}
        usersError={usersError}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onRoleChange={setRole}
        onUserFilterChange={setUserFilter}
        onAddMember={addMember}
        onRemoveMember={removeMember}
        onSave={save}
        onCancel={goToGroups}
      />
    </PageContainer>
  );
}
