'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import ErrorMessage from '@/components/ErrorMessage';
import PageContainer from '@/components/PageContainer';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import InfoMessage from '@/components/ui/InfoMessage';
import { useDataSetEdit } from '@/hooks/useDataSetEdit';
import DataSetEditForm from '@/components/data-sets/DataSetEditForm';

export default function EditDataSetPage() {
  const router = useRouter();
  const params = useParams();
  const dataSetId = params.id as string;
  const { status, data } = useRequireAuthRedirect();
  const roles = data?.user?.roles ?? [];
  const canViewMetadata = roles.includes('metadata_editor');
  const {
    dataSources,
    dataSets,
    selectedDataSources,
    selectedDataSets,
    description,
    dataSetType,
    preaggregationConfig,
    loading,
    saving,
    error,
    setDescription,
    setDataSetType,
    removeDataSource,
    removeDataSet,
    updatePreaggregationConfig,
    save,
  } = useDataSetEdit(dataSetId);

  if (status === 'unauthenticated') {
    return null;
  }

  if (status === 'loading' || loading) {
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

  const selectedSourcesList = dataSources.filter(ds => selectedDataSources.has(ds.id));
  const selectedSetsList = dataSets.filter(ds => selectedDataSets.has(ds.id));
  const totalSelected = selectedDataSources.size + selectedDataSets.size;
  const showTypeSelection = totalSelected > 1 && selectedDataSets.size === 0;

  return (
    <PageContainer className="min-h-screen" innerClassName="max-w-7xl mx-auto">
        <PageTitle className="mb-6">Edit Data Set</PageTitle>
        {error && <ErrorMessage message={error} className="mb-4" />}
      <DataSetEditForm
        description={description}
        dataSetType={dataSetType}
        selectedDataSources={selectedSourcesList}
        selectedDataSets={selectedSetsList}
        preaggregationConfig={preaggregationConfig}
        showTypeSelection={showTypeSelection}
        saving={saving}
        onDescriptionChange={setDescription}
        onTypeChange={setDataSetType}
        onRemoveDataSource={removeDataSource}
        onRemoveDataSet={removeDataSet}
        onPreaggregationConfigChange={updatePreaggregationConfig}
        onSave={save}
        onCancel={() => router.push('/data-sets')}
      />
    </PageContainer>
  );
}

