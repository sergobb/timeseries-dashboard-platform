'use client';

import { useRouter } from 'next/navigation';
import { useRequireAuthRedirect } from '@/hooks/useRequireAuthRedirect';
import ErrorMessage from '@/components/ErrorMessage';
import PageContainer from '@/components/PageContainer';
import Button from '@/components/ui/Button';
import InfoMessage from '@/components/ui/InfoMessage';
import { useNewDataSetPage } from '@/hooks/useNewDataSetPage';
import NewDataSetPageContent from '@/components/data-sets/NewDataSetPageContent';

export default function NewDataSetPage() {
  const router = useRouter();
  const { status, data } = useRequireAuthRedirect();
  const canViewMetadata = (data?.user?.roles ?? []).includes('metadata_editor');
  const page = useNewDataSetPage();

  if (status === 'unauthenticated') return null;
  if (status === 'loading' || page.loading) {
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
      <NewDataSetPageContent
        {...page}
        onFilterUnusedOnlyChange={page.setFilterUnusedOnly}
        onBack={() => router.push('/data-sets')}
        onNext={page.next}
      />
    </PageContainer>
  );
}
