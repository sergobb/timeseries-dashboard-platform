'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageContainer from '@/components/PageContainer';
import ErrorMessage from '@/components/ErrorMessage';
import InfoMessage from '@/components/ui/InfoMessage';
import Button from '@/components/ui/Button';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import { useDataSetCreation } from '@/hooks/useDataSetCreation';
import DataSetCreationForm from '@/components/data-sets/DataSetCreationForm';

export default function NewDataSetEditPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <InfoMessage message="Loading..." size="base" />
        </PageContainer>
      }
    >
      <NewDataSetEditPageInner />
    </Suspense>
  );
}

function NewDataSetEditPageInner() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const roles = session?.user?.roles ?? [];
  const canViewMetadata = roles.includes('metadata_editor');
  const { status: authStatus } = useRequireAuthRedirect();
  const canLoad = status === 'authenticated' && canViewMetadata;
  const creation = useDataSetCreation({ enabled: canLoad });

  if (authStatus === 'unauthenticated') return null;
  if (authStatus === 'loading' || status === 'loading') {
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
  if (creation.loading) {
    return (
      <PageContainer>
        <InfoMessage message="Loading..." size="base" />
      </PageContainer>
    );
  }

  return (
    <DataSetCreationForm
      description={creation.description}
      error={creation.error}
      totalSelected={creation.totalSelected}
      dataSetType={creation.dataSetType}
      useAggregation={creation.useAggregation}
      aggregationFunction={creation.aggregationFunction}
      aggregationInterval={creation.aggregationInterval}
      aggregationTimeUnit={creation.aggregationTimeUnit}
      creating={creation.creating}
      showTypeSelection={creation.showTypeSelection}
      showAggregationSection={creation.showAggregationSection}
      selectedSourcesList={creation.selectedSourcesList}
      selectedSetsList={creation.selectedSetsList}
      preaggregationConfig={creation.preaggregationConfig}
      onDescriptionChange={creation.setDescription}
      onErrorClear={() => creation.setError('')}
      onDataSetTypeChange={creation.setDataSetType}
      onUseAggregationChange={creation.setUseAggregation}
      onAggregationFunctionChange={creation.setAggregationFunction}
      onAggregationIntervalChange={creation.setAggregationInterval}
      onAggregationTimeUnitChange={creation.setAggregationTimeUnit}
      onRemoveDataSource={creation.removeDataSource}
      onRemoveDataSet={creation.removeDataSet}
      onPreaggChange={creation.updatePreaggregation}
      onCreate={creation.createDataSet}
      onBack={() => router.back()}
    />
  );
}
