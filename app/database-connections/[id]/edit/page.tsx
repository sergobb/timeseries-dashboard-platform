'use client';

import { use } from 'react';
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

export default function EditConnectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { status, data } = useRequireAuthRedirect();
  const roles = data?.user?.roles ?? [];
  const canViewConnections = roles.includes('db_admin');
  const { formData, loading, loadingData, error, updateField, update } = useDatabaseConnection(id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await update(id);
  };

  const handleCancel = () => {
    router.back();
  };

  if (status === 'unauthenticated') {
    return null;
  }

  if (status === 'loading' || loadingData) {
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
      <PageHeader title={<PageTitle>Edit Database Connection</PageTitle>} />
      <Container maxWidth="2xl">
        <DatabaseConnectionForm
          formData={formData}
          error={error}
          loading={loading}
          isEdit={true}
          onFieldChange={updateField}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Container>
    </PageContainer>
  );
}

