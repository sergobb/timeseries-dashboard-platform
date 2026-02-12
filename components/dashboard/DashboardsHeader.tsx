import { useSession } from 'next-auth/react';
import LinkButton from '@/components/ui/LinkButton';
import PageTitle from '@/components/ui/PageTitle';
import PageHeader from '@/components/ui/PageHeader';

export default function DashboardsHeader() {
  const { data: session } = useSession();

  return (
    <PageHeader
      title={<PageTitle>Dashboards</PageTitle>}
      description="Create and manage your analytics dashboards."
      action={
        session?.user ? (
          <LinkButton href="/dashboards/new" variant="primary">
            New Dashboard
          </LinkButton>
        ) : undefined
      }
    />
  );
}
