import { ChangeEvent } from 'react';
import Card from '@/components/ui/Card';
import Box from '@/components/ui/Box';
import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import Flex from '@/components/ui/Flex';

interface ProfilePasswordFormProps {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  saving: boolean;
  success: boolean;
  error: string | null;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmNewPasswordChange: (value: string) => void;
  onSave: () => void;
}

export default function ProfilePasswordForm({
  currentPassword,
  newPassword,
  confirmNewPassword,
  saving,
  success,
  error,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmNewPasswordChange,
  onSave,
}: ProfilePasswordFormProps) {
  const handleCurrentPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    onCurrentPasswordChange(e.target.value);
  };

  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    onNewPasswordChange(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    onConfirmNewPasswordChange(e.target.value);
  };

  const passwordsMismatch =
    newPassword.length > 0 &&
    confirmNewPassword.length > 0 &&
    newPassword !== confirmNewPassword;

  const canSubmit =
    !saving &&
    currentPassword.length > 0 &&
    newPassword.length >= 6 &&
    confirmNewPassword.length > 0 &&
    !passwordsMismatch;

  return (
    <Card className="p-6 space-y-6">
      <Box>
        <Label className="mb-2">
          Current Password <span className="text-red-500">*</span>
        </Label>
        <Input
          value={currentPassword}
          onChange={handleCurrentPasswordChange}
          placeholder="Current password"
          type="password"
        />
      </Box>
      <Box>
        <Label className="mb-2">
          New Password <span className="text-red-500">*</span>
        </Label>
        <Input
          value={newPassword}
          onChange={handleNewPasswordChange}
          placeholder="Enter new password"
          type="password"
          minLength={6}
        />
      </Box>
      <Box>
        <Label className="mb-2">
          Confirm New Password <span className="text-red-500">*</span>
        </Label>
        <Input
          value={confirmNewPassword}
          onChange={handleConfirmPasswordChange}
          placeholder="Confirm new password"
          type="password"
          minLength={6}
          className={
            passwordsMismatch
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
              : ''
          }
        />
      </Box>
      <Flex justify="between" align="center">
        <Box>
          {error && (
            <Text size="sm" variant="error">
              {error}
            </Text>
          )}
          {!error && success && (
            <Text size="sm" variant="muted">
              Password updated.
            </Text>
          )}
        </Box>
        <Button onClick={onSave} disabled={!canSubmit}>
          {saving ? 'Saving...' : 'Change Password'}
        </Button>
      </Flex>
    </Card>
  );
}
