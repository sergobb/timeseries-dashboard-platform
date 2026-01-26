import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { PRESET_RANGES } from '@/lib/date-ranges';
import { Group } from '@/types/group';
import DashboardGroupsSelector from './DashboardGroupsSelector';

interface DashboardFormProps {
  title: string;
  description: string;
  access: 'public' | 'private' | 'shared';
  defaultDateRange: string;
  groups: Group[];
  selectedGroupIds: string[];
  groupsLoading: boolean;
  groupsError: string | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onAccessChange: (access: 'public' | 'private' | 'shared') => void;
  onDefaultDateRangeChange: (range: string) => void;
  onGroupToggle: (groupId: string) => void;
}

export default function DashboardForm({
  title,
  description,
  access,
  defaultDateRange,
  groups,
  selectedGroupIds,
  groupsLoading,
  groupsError,
  onTitleChange,
  onDescriptionChange,
  onAccessChange,
  onDefaultDateRangeChange,
  onGroupToggle,
}: DashboardFormProps) {
  return (
    <>
      <FormField label="Title" required>
        <Input
          type="text"
          required
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </FormField>

      <FormField label="Description">
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
        />
      </FormField>

      <FormField label="Access Level">
        <Select
          value={access}
          onChange={(e) => onAccessChange(e.target.value as 'public' | 'private' | 'shared')}
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
          <option value="shared">Shared</option>
        </Select>
      </FormField>

      {access === 'shared' && (
        <DashboardGroupsSelector
          groups={groups}
          selectedGroupIds={selectedGroupIds}
          loading={groupsLoading}
          error={groupsError}
          onToggle={onGroupToggle}
        />
      )}

      <FormField label="Default Date Range">
        <Select
          value={defaultDateRange}
          onChange={(e) => onDefaultDateRangeChange(e.target.value)}
        >
          {PRESET_RANGES.map((preset) => (
            <option key={preset.label} value={preset.label}>
              {preset.label}
            </option>
          ))}
        </Select>
      </FormField>
    </>
  );
}
