'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ErrorMessage from '@/components/ErrorMessage';
import PageWrapper from '@/components/ui/PageWrapper';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Box from '@/components/ui/Box';
import Flex from '@/components/ui/Flex';
import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import LinkButton from '@/components/ui/LinkButton';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        router.push('/dashboards');
        router.refresh();
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="flex items-center justify-center">
      <Container maxWidth="md">
        <Card className="w-full space-y-8 p-8 shadow-lg">
          <Box>
            <Text className="text-2xl font-bold">
              Sign in to your account
            </Text>
          </Box>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <ErrorMessage message={error} />}
            <Flex direction="col" gap="4" align="stretch">
              <Box>
                <Label htmlFor="email" className="mb-1">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Box>
              <Box>
                <Label htmlFor="password" className="mb-1">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Box>
            </Flex>
            <Box>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Box>
            <Box className="text-center text-sm">
              <LinkButton
                href="/register"
                variant="secondary"
                className="border-none hover:bg-transparent font-medium text-[var(--color-foreground)] hover:text-[var(--color-muted-foreground)]"
              >
                Don&apos;t have an account? Register
              </LinkButton>
            </Box>
          </form>
        </Card>
      </Container>
    </PageWrapper>
  );
}

