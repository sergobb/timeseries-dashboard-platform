import LinkButton from '@/components/ui/LinkButton';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';

export default function DatabaseConnectionsHeader() {
  return (
    <PageHeader
      title={<PageTitle>Database Connections</PageTitle>}
      action={
        <LinkButton href="/database-connections/new">
          <Button>New Connection</Button>
        </LinkButton>
      }
    />
  );
}
