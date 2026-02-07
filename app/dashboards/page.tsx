'use client';

import { useSession } from 'next-auth/react';
import { useDashboards } from '@/hooks/useDashboards';
import PageContainer from '@/components/PageContainer';
import InfoMessage from '@/components/ui/InfoMessage';
import DashboardsHeader from '@/components/dashboard/DashboardsHeader';
import DashboardsContent from '@/components/dashboard/DashboardsContent';

export default function DashboardsPage() {
  const { data: session, status } = useSession();
  const { dashboards, loading, error, filterText, setFilterText, filteredDashboards, remove } = useDashboards();

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
        error={error}
        onFilterChange={setFilterText}
        onDelete={remove}
        currentUserId={session?.user?.id}
      />
    </PageContainer>
  );
}

