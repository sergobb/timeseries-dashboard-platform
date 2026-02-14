'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import ErrorMessage from '@/components/ErrorMessage';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import PageTitle from '@/components/ui/PageTitle';
import InfoMessage from '@/components/ui/InfoMessage';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import LinkButton from '@/components/ui/LinkButton';
import { useDataSourceEdit } from '@/hooks/useDataSourceEdit';
import { useTags } from '@/hooks/useTags';
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
    tagIds,
    loading,
    saving,
    uploading,
    error,
    fileInputRef,
    setDescription,
    addTag,
    removeTag,
    toggleColumn,
    updateColumnDescription,
    deactivateColumnsWithEmptyDescription,
    uploadFile,
    save,
  } = useDataSourceEdit(dataSourceId);
  const { tags, loading: tagsLoading, createTag } = useTags();

  if (status === 'unauthenticated') {
    return null;
  }

  if (status === 'loading' || loading) {
    return (
      <PageContainer>
        <Container maxWidth="4xl">
          <InfoMessage message="Loading..." size="base" />
        </Container>
      </PageContainer>
    );
  }

  if (!canViewMetadata) {
    return (
      <PageContainer>
        <Container maxWidth="4xl">
          <ErrorMessage message="Недостаточно прав. Требуется роль: metadata_editor." className="mb-4" />
          <LinkButton href="/" variant="secondary" className="mt-4">
            ← На главную
          </LinkButton>
        </Container>
      </PageContainer>
    );
  }

  if (!dataSource) {
    return (
      <PageContainer>
        <Container maxWidth="4xl">
          <Card className="p-4 border-[var(--color-error)]">
            <Text variant="error">Data source not found</Text>
          </Card>
          <LinkButton href="/data-sources" variant="secondary" className="mt-4">
            ← Back to Data Sources
          </LinkButton>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={<PageTitle>Edit Data Source</PageTitle>}
        description={
          dataSource.schemaName
            ? `${dataSource.schemaName}.${dataSource.tableName}`
            : dataSource.tableName
        }
      />
      <Container maxWidth="4xl">
        {error && !error.includes('Не найдено совпадений') && <ErrorMessage message={error} className="mb-4" />}
        <DataSourceEditForm
          description={description}
          columns={columns}
          uploading={uploading}
          saving={saving}
          fileInputRef={fileInputRef}
          error={error}
          tags={tags}
          tagsLoading={tagsLoading}
          selectedTagIds={tagIds}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          onCreateTag={createTag}
          onDescriptionChange={setDescription}
          onColumnToggle={toggleColumn}
          onColumnDescriptionChange={updateColumnDescription}
          onDeactivateColumnsWithEmptyDescription={deactivateColumnsWithEmptyDescription}
          onFileUpload={uploadFile}
          onSave={save}
          onCancel={() => router.push('/data-sources')}
        />
      </Container>
    </PageContainer>
  );
}

