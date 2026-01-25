import { auth } from '@/app/api/auth/[...nextauth]/route';
import PageWrapper from '@/components/ui/PageWrapper';
import Container from '@/components/ui/Container';
import Flex from '@/components/ui/Flex';
import PageTitle from '@/components/ui/PageTitle';
import Text from '@/components/ui/Text';
import LinkButton from '@/components/ui/LinkButton';

export default async function Home() {
  const session = await auth();

  return (
    <PageWrapper className="flex h-full flex-col items-center justify-center">
      <Container maxWidth="3xl">
        <Flex direction="col" align="center" gap="8" className="items-center">
          <PageTitle className="text-4xl text-center">
            Timeseries Dashboard Platform
          </PageTitle>
          <Text size="lg" variant="muted" className="text-center">
            Connect to external databases, create metadata, and build interactive dashboards with Plotly
          </Text>
          <Flex gap="4">
            {session ? (
              <>
                <LinkButton
                  href="/dashboards"
                  variant="primary"
                  size="lg"
                >
                  View Dashboards
                </LinkButton>
                <LinkButton
                  href="/database-connections"
                  variant="secondary"
                  size="lg"
                >
                  Database Connections
                </LinkButton>
              </>
            ) : (
              <>
                <LinkButton
                  href="/login"
                  variant="primary"
                  size="lg"
                >
                  Sign In
                </LinkButton>
                <LinkButton
                  href="/register"
                  variant="secondary"
                  size="lg"
                >
                  Register
                </LinkButton>
              </>
            )}
          </Flex>
        </Flex>
      </Container>
    </PageWrapper>
  );
}
