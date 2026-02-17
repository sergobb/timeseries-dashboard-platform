'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useDashboards } from '@/hooks/useDashboards';
import { useTags } from '@/hooks/useTags';
import PageContainer from '@/components/PageContainer';
import InfoMessage from '@/components/ui/InfoMessage';
import DashboardsHeader from '@/components/dashboard/DashboardsHeader';
import DashboardsContent from '@/components/dashboard/DashboardsContent';
import type { Dashboard } from '@/types/dashboard';

export default function DashboardsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    dashboards,
    loading,
    error,
    filterText,
    setFilterText,
    filterTagIds,
    toggleFilterTag,
    filteredDashboards,
    remove,
  } = useDashboards();
  const { tags, loading: tagsLoading } = useTags();

  const currentUserId = session?.user?.id;
  const isOwner = (d: Dashboard) => Boolean(currentUserId && d.createdBy === currentUserId);
  const canEdit = (d: Dashboard) => isOwner(d) || Boolean(d.canEdit);
  const displayDashboards = useMemo(() => {
    const owned = (d: Dashboard) => Boolean(currentUserId && d.createdBy === currentUserId);
    return [...filteredDashboards].sort((a, b) => Number(owned(b)) - Number(owned(a)));
  }, [filteredDashboards, currentUserId]);

  if (status === 'loading' || loading) {
    return (
      <PageContainer>
        <InfoMessage message="Loading..." size="base" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DashboardsHeader />
      <DashboardsContent
        dashboards={dashboards}
        displayDashboards={displayDashboards}
        filterText={filterText}
        tags={tags}
        tagsLoading={tagsLoading}
        filterTagIds={filterTagIds}
        onFilterTagToggle={toggleFilterTag}
        error={error}
        onFilterChange={setFilterText}
        onDelete={remove}
        onEdit={(id) => router.push(`/dashboards/${id}/edit`)}
        onCreateNew={() => router.push('/dashboards/new')}
        canEdit={canEdit}
        isOwner={isOwner}
      />
    </PageContainer>
  );
}

