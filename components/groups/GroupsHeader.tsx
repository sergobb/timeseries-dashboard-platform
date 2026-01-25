import { useSession } from 'next-auth/react';
import PageHeader from '@/components/ui/PageHeader';
import PageTitle from '@/components/ui/PageTitle';
import LinkButton from '@/components/ui/LinkButton';
import Button from '@/components/ui/Button';

export default function GroupsHeader() {
  const { data: session } = useSession();

  return (
    <PageHeader
      title={<PageTitle>My Groups</PageTitle>}
      action={
        session?.user && (
          <LinkButton href="/groups/new">
            <Button>New Group</Button>
          </LinkButton>
        )
      }
    />
  );
}
