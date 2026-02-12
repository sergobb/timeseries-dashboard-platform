'use client';

import type { UseRegisterReturn } from '@/hooks/useRegister';
import ErrorMessage from '@/components/ErrorMessage';
import PageWrapper from '@/components/ui/PageWrapper';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Box from '@/components/ui/Box';
import Flex from '@/components/ui/Flex';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import LinkButton from '@/components/ui/LinkButton';

interface RegisterFormProps extends UseRegisterReturn {}

export default function RegisterForm({
  email,
  password,
  confirmPassword,
  lastName,
  firstName,
  middleName,
  organization,
  department,
  error,
  loading,
  passwordsMismatch,
  canSubmit,
  setEmail,
  setPassword,
  setConfirmPassword,
  setLastName,
  setFirstName,
  setMiddleName,
  setOrganization,
  setDepartment,
  submit,
}: RegisterFormProps) {
  return (
    <PageWrapper className="flex items-center justify-center min-h-screen bg-[var(--color-surface-subtle)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-[var(--color-surface-muted)]/30 pointer-events-none" aria-hidden />
      <Container maxWidth="2xl" className="w-full relative">
        <Card className="w-full space-y-8 p-8 shadow-lg border border-[var(--color-border-muted)]">
          <Box>
            <h1 className="font-display text-2xl font-bold text-[var(--color-foreground)]">
              Create your account
            </h1>
            <Text size="sm" variant="muted" className="mt-2">
              Fill in your details to get started.
            </Text>
          </Box>
          <form className="mt-8 space-y-6" onSubmit={submit}>
            {error && <ErrorMessage message={error} />}
            <Flex direction="col" gap="4" align="stretch">
              <FormField label="E-mail address/Login" required>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="Enter e-mail address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>
              <FormField label="Last Name" required>
                <Input
                  name="lastName"
                  type="text"
                  required
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </FormField>
              <FormField label="First Name" required>
                <Input
                  name="firstName"
                  type="text"
                  required
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </FormField>
              <FormField label="Middle Name (optional)">
                <Input
                  name="middleName"
                  type="text"
                  placeholder="Enter middle name (optional)"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </FormField>
              <FormField label="Organization (optional)">
                <Input
                  name="organization"
                  type="text"
                  placeholder="Enter organization (optional)"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </FormField>
              <FormField label="Department (optional)">
                <Input
                  name="department"
                  type="text"
                  placeholder="Enter department (optional)"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </FormField>
              <FormField label="Password" required>
                <Input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormField>
              <FormField
                label="Confirm Password"
                required
                error={passwordsMismatch ? 'Passwords do not match' : undefined}
              >
                <Input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={
                    passwordsMismatch
                      ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
                      : ''
                  }
                />
              </FormField>
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
