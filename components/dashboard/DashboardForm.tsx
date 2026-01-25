import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Label from '@/components/ui/Label';
import Box from '@/components/ui/Box';
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
      <Box>
        <Label htmlFor="title" className="mb-2">
          Title
        </Label>
        <Input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </Box>

      <Box>
        <Label htmlFor="description" className="mb-2">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
        />
      </Box>

      <Box>
        <Label htmlFor="access" className="mb-2">
          Access Level
        </Label>
        <Select
          id="access"
          value={access}
          onChange={(e) => onAccessChange(e.target.value as 'public' | 'private' | 'shared')}
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
          <option value="shared">Shared</option>
        </Select>
      </Box>

      {access === 'shared' && (
        <DashboardGroupsSelector
          groups={groups}
          selectedGroupIds={selectedGroupIds}
          loading={groupsLoading}
          error={groupsError}
          onToggle={onGroupToggle}
        />
      )}

      <Box>
        <Label htmlFor="defaultDateRange" className="mb-2">
          Default Date Range
        </Label>
        <Select
          id="defaultDateRange"
          value={defaultDateRange}
          onChange={(e) => onDefaultDateRangeChange(e.target.value)}
        >
          {PRESET_RANGES.map((preset) => (
            <option key={preset.label} value={preset.label}>
              {preset.label}
            </option>
          ))}
        </Select>
      </Box>
    </>
  );
}
