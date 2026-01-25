'use client';

import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import InfoMessage from '@/components/ui/InfoMessage';
import GroupsHeader from '@/components/groups/GroupsHeader';
import GroupsContent from '@/components/groups/GroupsContent';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import { useGroups } from '@/hooks/useGroups';

export default function GroupsPage() {
  const router = useRouter();
  const { status } = useRequireAuthRedirect();
  const {
    groups,
    loading,
    error,
    filterText,
    setFilterText,
    filteredGroups,
    remove,
  } = useGroups();

  const editGroup = (groupId: string) => {
    router.push(`/groups/${groupId}/edit`);
  };

  if (status === 'loading' || loading) {
    return (
      <PageContainer>
        <InfoMessage message="Loading..." size="base" />
      </PageContainer>
    );
  }

  return (
    <PageContainer flex innerClassName="h-full flex flex-col min-h-0">
      <GroupsHeader />
      <GroupsContent
        groups={groups}
        filteredGroups={filteredGroups}
        filterText={filterText}
        error={error}
        onFilterChange={setFilterText}
        onEdit={editGroup}
        onDelete={remove}
      />
    </PageContainer>
  );
}
