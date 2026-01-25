'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/ui/PageTitle';
import InfoMessage from '@/components/ui/InfoMessage';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import LinkButton from '@/components/ui/LinkButton';
import Box from '@/components/ui/Box';
import PageWrapper from '@/components/ui/PageWrapper';
import { useDataSourceEdit } from '@/hooks/useDataSourceEdit';
import DataSourceEditForm from '@/components/data-sources/DataSourceEditForm';

export default function EditDataSourcePage() {
  const router = useRouter();
  const params = useParams();
  const dataSourceId = params?.id as string;
  const { status, data } = useRequireAuthRedirect();
  const roles = data?.user?.roles ?? [];
  const canViewMetadata = roles.includes('metadata_editor');
  const {
    dataSource,
    description,
    columns,
    loading,
    saving,
    uploading,
    error,
    fileInputRef,
    setDescription,
    toggleColumn,
    updateColumnDescription,
    uploadFile,
    save,
  } = useDataSourceEdit(dataSourceId);

  if (status === 'unauthenticated') {
    return null;
  }

  if (status === 'loading' || loading) {
    return (
      <PageWrapper>
        <Container maxWidth="4xl">
          <InfoMessage message="Loading..." size="base" />
        </Container>
      </PageWrapper>
    );
  }

  if (!canViewMetadata) {
    return (
      <PageWrapper>
        <Container maxWidth="4xl">
          <ErrorMessage message="Недостаточно прав. Требуется роль: metadata_editor." className="mb-4" />
          <LinkButton
            href="/"
            variant="secondary"
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 border-none hover:bg-transparent"
          >
            ← На главную
          </LinkButton>
        </Container>
      </PageWrapper>
    );
  }

  if (!dataSource) {
    return (
      <PageWrapper>
        <Container maxWidth="4xl">
          <Card className="p-4 bg-red-50 dark:bg-red-900/20">
            <Text variant="error">Data source not found</Text>
          </Card>
          <LinkButton
            href="/data-sources"
            variant="secondary"
            className="mt-4 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 border-none hover:bg-transparent"
          >
            ← Back to Data Sources
          </LinkButton>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth="4xl">
        <Box className="mb-6">
          <PageTitle className="mt-4">Edit Data Source</PageTitle>
          <Text variant="muted" className="mt-2">
            {dataSource.schemaName ? `${dataSource.schemaName}.` : ''}{dataSource.tableName}
          </Text>
        </Box>
        {error && !error.includes('Не найдено совпадений') && <ErrorMessage message={error} className="mb-4" />}
        <DataSourceEditForm
          description={description}
          columns={columns}
          uploading={uploading}
          saving={saving}
          fileInputRef={fileInputRef}
          error={error}
          onDescriptionChange={setDescription}
          onColumnToggle={toggleColumn}
          onColumnDescriptionChange={updateColumnDescription}
          onFileUpload={uploadFile}
          onSave={save}
          onCancel={() => router.push('/data-sources')}
        />
      </Container>
    </PageWrapper>
  );
}

