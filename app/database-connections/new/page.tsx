'use client';

import { useRouter } from 'next/navigation';
import { useDatabaseConnection } from '@/hooks/useDatabaseConnection';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import PageTitle from '@/components/ui/PageTitle';
import Container from '@/components/ui/Container';
import InfoMessage from '@/components/ui/InfoMessage';
import DatabaseConnectionForm from '@/components/database-connections/DatabaseConnectionForm';
import ErrorMessage from '@/components/ErrorMessage';

export default function NewConnectionPage() {
  const router = useRouter();
  const { status, data } = useRequireAuthRedirect();
  const roles = data?.user?.roles ?? [];
  const canViewConnections = roles.includes('db_admin');
  const { formData, loading, error, updateField, create } = useDatabaseConnection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create();
  };

  const handleCancel = () => {
    router.back();
  };

  if (status === 'unauthenticated') {
    return null;
  }

  if (status === 'loading') {
    return (
      <PageContainer>
        <Container maxWidth="2xl">
          <InfoMessage message="Loading..." size="base" />
        </Container>
      </PageContainer>
    );
  }

  if (!canViewConnections) {
    return (
      <PageContainer>
        <Container maxWidth="2xl">
          <ErrorMessage message="Недостаточно прав. Требуется роль: db_admin." className="mb-4" />
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={<PageTitle>New Database Connection</PageTitle>} />
      <Container maxWidth="2xl">
        <DatabaseConnectionForm
          formData={formData}
          error={error}
          loading={loading}
          isEdit={false}
          onFieldChange={updateField}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Container>
    </PageContainer>
  );
}

