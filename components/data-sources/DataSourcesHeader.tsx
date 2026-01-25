import { useSession } from 'next-auth/react';
import LinkButton from '@/components/ui/LinkButton';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';

export default function DataSourcesHeader() {
  const { data: session } = useSession();

  return (
    <PageHeader
      title={<PageTitle>Data Sources</PageTitle>}
      action={
        session?.user && (
          <LinkButton href="/data-sources/new">
            <Button>New Data Source</Button>
          </LinkButton>
        )
      }
    />
  );
}
