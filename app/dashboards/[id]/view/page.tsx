'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import PageTitle from '@/components/ui/PageTitle';
import LinkButton from '@/components/ui/LinkButton';
import Flex from '@/components/ui/Flex';
import InfoMessage from '@/components/ui/InfoMessage';
import { useDashboard } from '@/hooks/useDashboard';
import DashboardView from '@/components/dashboard/DashboardView';

export default function DashboardViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { dashboard, loading, error } = useDashboard(id);

  useEffect(() => {
    if (!loading && !dashboard) router.replace('/dashboards');
  }, [loading, dashboard, router]);

  if (loading) {
    return (
      <PageContainer>
        <InfoMessage message="Loading..." size="base" />
      </PageContainer>
    );
  }

  if (!dashboard) return null;

  return (
    <PageContainer>
      <div className="sticky top-0 z-10 -mx-8 px-8 py-4 bg-[var(--color-background)] border-b border-[var(--color-border-muted)] mb-6">
        <PageHeader
          title={<PageTitle>{dashboard.title}</PageTitle>}
          description={dashboard.description ?? undefined}
          action={
            <Flex gap="2" align="center">
              <LinkButton
                href={`/dashboards/${dashboard.id}/edit`}
                variant="secondary"
                size="sm"
              >
                Edit
              </LinkButton>
            </Flex>
          }
        />
      </div>
      <DashboardView dashboard={dashboard} />
    </PageContainer>
  );
}
