import { ChangeEvent } from 'react';
import Card from '@/components/ui/Card';
import Box from '@/components/ui/Box';
import Label from '@/components/ui/Label';
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
  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFirstNameChange(e.target.value);
  };

  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onLastNameChange(e.target.value);
  };

  const handleMiddleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onMiddleNameChange(e.target.value);
  };

  const handleOrganizationChange = (e: ChangeEvent<HTMLInputElement>) => {
    onOrganizationChange(e.target.value);
  };

  const handleDepartmentChange = (e: ChangeEvent<HTMLInputElement>) => {
    onDepartmentChange(e.target.value);
  };

  return (
    <Card className="p-6 space-y-6">
      <Box>
        <Label className="mb-2">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input value={email} disabled />
        <Text size="xs" variant="muted" className="mt-2">
          Email cannot be changed.
        </Text>
      </Box>
      <Box>
        <Label className="mb-2">
          Last Name <span className="text-red-500">*</span>
        </Label>
        <Input
          value={lastName}
          onChange={handleLastNameChange}
          placeholder="Enter last name"
          required
        />
      </Box>
      <Box>
        <Label className="mb-2">
          First Name <span className="text-red-500">*</span>
        </Label>
        <Input
          value={firstName}
          onChange={handleFirstNameChange}
          placeholder="Enter first name"
          required
        />
      </Box>
      <Box>
        <Label className="mb-2">Middle Name</Label>
        <Input
          value={middleName}
          onChange={handleMiddleNameChange}
          placeholder="Enter middle name (optional)"
        />
      </Box>
      <Box>
        <Label className="mb-2">Organization</Label>
        <Input
          value={organization}
          onChange={handleOrganizationChange}
          placeholder="Enter organization (optional)"
        />
      </Box>
      <Box>
        <Label className="mb-2">Department</Label>
        <Input
          value={department}
          onChange={handleDepartmentChange}
          placeholder="Enter department (optional)"
        />
      </Box>
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
