'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useDashboards } from '@/hooks/useDashboards';
import PageContainer from '@/components/PageContainer';
import InfoMessage from '@/components/ui/InfoMessage';
import DashboardsHeader from '@/components/dashboard/DashboardsHeader';
import DashboardsContent from '@/components/dashboard/DashboardsContent';

export default function DashboardsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { dashboards, loading, error, remove } = useDashboards();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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
        error={error}
        onDelete={remove}
        currentUserId={session?.user?.id}
      />
    </PageContainer>
  );
}

