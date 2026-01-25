import { useSession } from 'next-auth/react';
import LinkButton from '@/components/ui/LinkButton';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';

export default function DashboardsHeader() {
  const { data: session } = useSession();

  return (
    <PageHeader
      title={<PageTitle>Dashboards</PageTitle>}
      action={
        session?.user && (
          <LinkButton href="/dashboards/new">
            <Button>New Dashboard</Button>
          </LinkButton>
        )
      }
    />
  );
}
