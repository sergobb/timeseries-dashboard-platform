import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import { PRESET_RANGES, CUSTOM_RANGE_LABEL, getInitialDateRange } from '@/lib/date-ranges';
import { Group } from '@/types/group';
import DashboardGroupsSelector from './DashboardGroupsSelector';
import DateTimeRangePicker from '@/components/ui/DateTimeRangePicker';

interface DashboardFormProps {
  title: string;
  description: string;
  isPublic: boolean;
  defaultDateRange: string;
  customDateRange: { from: string; to: string } | null;
  groups: Group[];
  selectedGroupIds: string[];
  groupsLoading: boolean;
  groupsError: string | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onIsPublicChange: (isPublic: boolean) => void;
  onDefaultDateRangeChange: (range: string) => void;
  onCustomDateRangeChange: (range: { from: string; to: string } | null) => void;
  onGroupToggle: (groupId: string) => void;
}

export default function DashboardForm({
  title,
  description,
  isPublic,
  defaultDateRange,
  customDateRange,
  groups,
  selectedGroupIds,
  groupsLoading,
  groupsError,
  onTitleChange,
  onDescriptionChange,
  onIsPublicChange,
  onDefaultDateRangeChange,
  onCustomDateRangeChange,
  onGroupToggle,
}: DashboardFormProps) {
  const customRangeValue = defaultDateRange === CUSTOM_RANGE_LABEL
    ? (customDateRange?.from && customDateRange?.to
        ? { from: new Date(customDateRange.from), to: new Date(customDateRange.to) }
        : getInitialDateRange('Last 7 Days'))
    : null;
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
          <option value={CUSTOM_RANGE_LABEL}>{CUSTOM_RANGE_LABEL}</option>
        </Select>
        {defaultDateRange === CUSTOM_RANGE_LABEL && customRangeValue && (
          <div className="mt-2">
            <DateTimeRangePicker
              value={customRangeValue}
              onChange={(r) => r && onCustomDateRangeChange({ from: r.from.toISOString(), to: r.to.toISOString() })}
            />
          </div>
        )}
      </FormField>
    </>
  );
}
