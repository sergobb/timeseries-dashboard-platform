'use client';

import { useSession } from 'next-auth/react';
import { useDashboards } from '@/hooks/useDashboards';
import { useTags } from '@/hooks/useTags';
import PageContainer from '@/components/PageContainer';
import InfoMessage from '@/components/ui/InfoMessage';
import DashboardsHeader from '@/components/dashboard/DashboardsHeader';
import DashboardsContent from '@/components/dashboard/DashboardsContent';

export default function DashboardsPage() {
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
        filteredDashboards={filteredDashboards}
        filterText={filterText}
        tags={tags}
        tagsLoading={tagsLoading}
        filterTagIds={filterTagIds}
        onFilterTagToggle={toggleFilterTag}
        error={error}
        onFilterChange={setFilterText}
        onDelete={remove}
        currentUserId={session?.user?.id}
      />
    </PageContainer>
  );
}

