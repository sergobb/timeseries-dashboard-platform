import Card from '@/components/ui/Card';
import Box from '@/components/ui/Box';
import FormField from '@/components/ui/FormField';
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
      <FormField label="Current Password" required>
        <Input
          value={currentPassword}
          onChange={(e) => onCurrentPasswordChange(e.target.value)}
          placeholder="Current password"
          type="password"
        />
      </FormField>
      <FormField label="New Password" required>
        <Input
          value={newPassword}
          onChange={(e) => onNewPasswordChange(e.target.value)}
          placeholder="Enter new password"
          type="password"
          minLength={6}
        />
      </FormField>
      <FormField
        label="Confirm New Password"
        required
        error={passwordsMismatch ? 'Passwords do not match' : undefined}
      >
        <Input
          value={confirmNewPassword}
          onChange={(e) => onConfirmNewPasswordChange(e.target.value)}
          placeholder="Confirm new password"
          type="password"
          minLength={6}
          className={
            passwordsMismatch
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
              : ''
          }
        />
      </FormField>
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
