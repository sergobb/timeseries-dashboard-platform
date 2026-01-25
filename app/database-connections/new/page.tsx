'use client';

import { useRouter } from 'next/navigation';
import { useDatabaseConnection } from '@/hooks/useDatabaseConnection';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import PageWrapper from '@/components/ui/PageWrapper';
import Container from '@/components/ui/Container';
import PageTitle from '@/components/ui/PageTitle';
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
      <PageWrapper>
        <Container maxWidth="2xl">
          <InfoMessage message="Loading..." size="base" />
        </Container>
      </PageWrapper>
    );
  }

  if (!canViewConnections) {
    return (
      <PageWrapper>
        <Container maxWidth="2xl">
          <ErrorMessage message="Недостаточно прав. Требуется роль: db_admin." className="mb-4" />
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth="2xl">
        <PageTitle className="mb-8">New Database Connection</PageTitle>
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
    </PageWrapper>
  );
}

