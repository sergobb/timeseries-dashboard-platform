'use client';

import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import DashboardBuilder from '@/components/dashboard/DashboardBuilder';
import ErrorMessage from '@/components/ErrorMessage';
import InfoMessage from '@/components/ui/InfoMessage';
import Button from '@/components/ui/Button';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';

export default function NewDashboardPage() {
  const router = useRouter();
  const { status, data } = useRequireAuthRedirect();
  const roles = data?.user?.roles ?? [];
  const canCreateDashboard = roles.includes('dashboard_creator');

  if (status === 'unauthenticated') {
    return null;
  }

  if (status === 'loading') {
    return (
      <PageContainer>
        <InfoMessage message="Loading..." size="base" />
      </PageContainer>
    );
  }

  if (!canCreateDashboard) {
    return (
      <PageContainer>
        <ErrorMessage message="Недостаточно прав. Требуется роль: dashboard_creator." className="mb-4" />
        <Button onClick={() => router.push('/')} variant="secondary">
          На главную
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="min-h-screen" innerClassName="max-w-7xl mx-auto">
      <DashboardBuilder />
    </PageContainer>
  );
}

