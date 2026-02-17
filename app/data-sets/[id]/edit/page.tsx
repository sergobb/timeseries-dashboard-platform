'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import ErrorMessage from '@/components/ErrorMessage';
import PageContainer from '@/components/PageContainer';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import InfoMessage from '@/components/ui/InfoMessage';
import { useDataSetEdit } from '@/hooks/useDataSetEdit';
import { useTags } from '@/hooks/useTags';
import DataSetEditForm from '@/components/data-sets/DataSetEditForm';

export default function EditDataSetPage() {
  const router = useRouter();
  const params = useParams();
  const dataSetId = params.id as string;
  const { status, data } = useRequireAuthRedirect();
  const canViewMetadata = (data?.user?.roles ?? []).includes('metadata_editor');
  const edit = useDataSetEdit(dataSetId);
  const { tags, loading: tagsLoading, createTag } = useTags();

  if (status === 'unauthenticated') return null;
  if (status === 'loading' || edit.loading) {
    return (
      <PageContainer>
        <InfoMessage message="Loading..." size="base" />
      </PageContainer>
    );
  }
  if (!canViewMetadata) {
    return (
      <PageContainer>
        <ErrorMessage message="Недостаточно прав. Требуется роль: metadata_editor." className="mb-4" />
        <Button onClick={() => router.push('/')} variant="secondary">
          На главную
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="min-h-screen" innerClassName="max-w-7xl mx-auto">
      <PageTitle className="mb-6">Edit Data Set</PageTitle>
      {edit.error && <ErrorMessage message={edit.error} className="mb-4" />}
      <DataSetEditForm
        description={edit.description}
        tags={tags}
        tagsLoading={tagsLoading}
        selectedTagIds={edit.tagIds}
        onAddTag={edit.addTag}
        onRemoveTag={edit.removeTag}
        onCreateTag={createTag}
        dataSetType={edit.dataSetType}
        selectedDataSources={edit.selectedSourcesList}
        preaggregationConfig={edit.preaggregationConfig}
        showTypeSelection={edit.showTypeSelection}
        showAggregationSection={edit.showAggregationSection}
        useAggregation={edit.useAggregation}
        aggregationFunction={edit.aggregationFunction}
        aggregationInterval={edit.aggregationInterval}
        aggregationTimeUnit={edit.aggregationTimeUnit}
        saving={edit.saving}
        onDescriptionChange={edit.setDescription}
        onTypeChange={edit.setDataSetType}
        availableDataSources={edit.availableDataSources}
        onAddDataSource={edit.addDataSource}
        onRemoveDataSource={edit.removeDataSource}
        onPreaggregationConfigChange={edit.updatePreaggregationConfig}
        onUseAggregationChange={edit.setUseAggregation}
        onAggregationFunctionChange={edit.setAggregationFunction}
        onAggregationIntervalChange={edit.setAggregationInterval}
        onAggregationTimeUnitChange={edit.setAggregationTimeUnit}
        onSave={edit.save}
        onCancel={() => router.push('/data-sets')}
      />
    </PageContainer>
  );
}
