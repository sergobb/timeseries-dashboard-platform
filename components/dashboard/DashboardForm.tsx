import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import { PRESET_RANGES } from '@/lib/date-ranges';
import { Group } from '@/types/group';
import DashboardGroupsSelector from './DashboardGroupsSelector';

interface DashboardFormProps {
  title: string;
  description: string;
  isPublic: boolean;
  defaultDateRange: string;
  groups: Group[];
  selectedGroupIds: string[];
  groupsLoading: boolean;
  groupsError: string | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onIsPublicChange: (isPublic: boolean) => void;
  onDefaultDateRangeChange: (range: string) => void;
  onGroupToggle: (groupId: string) => void;
}

export default function DashboardForm({
  title,
  description,
  isPublic,
  defaultDateRange,
  groups,
  selectedGroupIds,
  groupsLoading,
  groupsError,
  onTitleChange,
  onDescriptionChange,
  onIsPublicChange,
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

      <FormField label="Access">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={isPublic}
            onCheckedChange={(checked) => onIsPublicChange(checked === true)}
          />
          <span>Public — anyone can view</span>
        </label>
      </FormField>

      <FormField label="Shared with groups">
        <DashboardGroupsSelector
          groups={groups}
          selectedGroupIds={selectedGroupIds}
          loading={groupsLoading}
          error={groupsError}
          onToggle={onGroupToggle}
        />
      </FormField>

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
