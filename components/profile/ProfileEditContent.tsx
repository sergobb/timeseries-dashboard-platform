'use client';

import ErrorMessage from '@/components/ErrorMessage';
import InfoMessage from '@/components/ui/InfoMessage';
import PageTitle from '@/components/ui/PageTitle';
import Text from '@/components/ui/Text';
import Box from '@/components/ui/Box';
import { useProfileEdit } from '@/hooks/useProfileEdit';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import ProfilePasswordForm from '@/components/profile/ProfilePasswordForm';

export default function ProfileEditContent() {
  const {
    status,
    profile,
    firstName,
    lastName,
    middleName,
    organization,
    department,
    loading,
    saving,
    success,
    error,
    currentPassword,
    newPassword,
    confirmNewPassword,
    passwordSaving,
    passwordSuccess,
    passwordError,
    setFirstName,
    setLastName,
    setMiddleName,
    setOrganization,
    setDepartment,
    setCurrentPassword,
    setNewPassword,
    setConfirmNewPassword,
    save,
    changePassword,
  } = useProfileEdit();

  if (status === 'unauthenticated') return null;

  if (status === 'loading' || loading) {
    return (
      <Box>
        <InfoMessage message="Loading..." size="base" />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box>
        <ErrorMessage message={error || 'Profile not found'} />
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      <Box>
        <PageTitle className="mt-4">Edit Profile</PageTitle>
        <Text variant="muted" className="mt-2">
          Update your personal information. Email cannot be changed.
        </Text>
      </Box>
      {error && <ErrorMessage message={error} />}
      <ProfileEditForm
        email={profile.email}
        firstName={firstName}
        lastName={lastName}
        middleName={middleName}
        organization={organization}
        department={department}
        saving={saving}
        success={success}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
        onMiddleNameChange={setMiddleName}
        onOrganizationChange={setOrganization}
        onDepartmentChange={setDepartment}
        onSave={save}
      />
      <ProfilePasswordForm
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmNewPassword={confirmNewPassword}
        saving={passwordSaving}
        success={passwordSuccess}
        error={passwordError}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={setNewPassword}
        onConfirmNewPasswordChange={setConfirmNewPassword}
        onSave={changePassword}
      />
    </Box>
  );
}
