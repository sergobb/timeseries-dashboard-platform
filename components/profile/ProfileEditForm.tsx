import Card from '@/components/ui/Card';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import Flex from '@/components/ui/Flex';

interface ProfileEditFormProps {
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  organization: string;
  department: string;
  saving: boolean;
  success: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onMiddleNameChange: (value: string) => void;
  onOrganizationChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onSave: () => void;
}

export default function ProfileEditForm({
  email,
  firstName,
  lastName,
  middleName,
  organization,
  department,
  saving,
  success,
  onFirstNameChange,
  onLastNameChange,
  onMiddleNameChange,
  onOrganizationChange,
  onDepartmentChange,
  onSave,
}: ProfileEditFormProps) {
  return (
    <Card className="p-6 space-y-6">
      <FormField
        label="Email"
        required
        hint="Email cannot be changed."
      >
        <Input value={email} disabled />
      </FormField>
      <FormField
        label="Last Name"
        required
      >
        <Input
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          placeholder="Enter last name"
          required
        />
      </FormField>
      <FormField
        label="First Name"
        required
      >
        <Input
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          placeholder="Enter first name"
          required
        />
      </FormField>
      <FormField label="Middle Name">
        <Input
          value={middleName}
          onChange={(e) => onMiddleNameChange(e.target.value)}
          placeholder="Enter middle name (optional)"
        />
      </FormField>
      <FormField label="Organization">
        <Input
          value={organization}
          onChange={(e) => onOrganizationChange(e.target.value)}
          placeholder="Enter organization (optional)"
        />
      </FormField>
      <FormField label="Department">
        <Input
          value={department}
          onChange={(e) => onDepartmentChange(e.target.value)}
          placeholder="Enter department (optional)"
        />
      </FormField>
      <Flex justify="between" align="center">
        {success ? (
          <Text size="sm" variant="muted">
            Profile updated.
          </Text>
        ) : (
          <span />
        )}
        <Button onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </Flex>
    </Card>
  );
}
