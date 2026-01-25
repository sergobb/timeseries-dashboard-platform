'use client';

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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [organization, setOrganization] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordsMismatch =
    password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;

  const canSubmit =
    !loading &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    lastName.trim().length > 0 &&
    firstName.trim().length > 0 &&
    confirmPassword.length > 0 &&
    !passwordsMismatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          lastName,
          firstName,
          middleName: middleName || undefined,
          organization: organization || undefined,
          department: department || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      router.push('/login');
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="flex items-center justify-center">
      <Container maxWidth="2xl" className="w-full">
        <Card className="w-full space-y-8 p-8 shadow-lg">
          <Box>
            <Text className="text-2xl font-bold">
              Create your account
            </Text>
          </Box>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <ErrorMessage message={error} />}
            <Flex direction="col" gap="4" align="stretch">
              <Box>
                <Label htmlFor="email" className="mb-1">
                  E-mail address/Login <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter e-mail address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Box>
              <Box>
                <Label htmlFor="lastName" className="mb-1">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Box>
              <Box>
                <Label htmlFor="firstName" className="mb-1">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Box>
              <Box>
                <Label htmlFor="middleName" className="mb-1">
                  Middle Name (optional)
                </Label>
                <Input
                  id="middleName"
                  name="middleName"
                  type="text"
                  placeholder="Enter middle name (optional)"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </Box>
              <Box>
                <Label htmlFor="organization" className="mb-1">
                  Organization (optional)
                </Label>
                <Input
                  id="organization"
                  name="organization"
                  type="text"
                  placeholder="Enter organization (optional)"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </Box>
              <Box>
                <Label htmlFor="department" className="mb-1">
                  Department (optional)
                </Label>
                <Input
                  id="department"
                  name="department"
                  type="text"
                  placeholder="Enter department (optional)"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </Box>
              <Box>
                <Label htmlFor="password" className="mb-1">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Box>
              <Box>
                <Label htmlFor="confirmPassword" className="mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={
                    passwordsMismatch
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                      : ''
                  }
                />
              </Box>
            </Flex>
            <Box className="flex justify-center">
              <Button type="submit" disabled={!canSubmit}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </Box>
            <Box className="text-center text-sm">
              <LinkButton
                href="/login"
                variant="secondary"
                className="border-none hover:bg-transparent font-medium text-[var(--color-foreground)] hover:text-[var(--color-muted-foreground)]"
              >
                Already have an account? Sign in
              </LinkButton>
            </Box>
          </form>
        </Card>
      </Container>
    </PageWrapper>
  );
}

