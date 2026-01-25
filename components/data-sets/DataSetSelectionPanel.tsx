import { DataSource } from '@/types/data-source';
import { DataSet } from '@/types/data-set';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import InfoMessage from '@/components/ui/InfoMessage';

interface DataSetSelectionPanelProps<T extends DataSource | DataSet> {
  title: string;
  items: T[];
  selectedIds: Set<string>;
  filter: string;
  onFilterChange: (value: string) => void;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  disabled?: boolean;
  getDisplayName: (item: T) => string;
  getDescription: (item: T) => string | undefined;
}

export default function DataSetSelectionPanel<T extends DataSource | DataSet>({
  title,
  items,
  selectedIds,
  filter,
  onFilterChange,
  onToggle,
  onSelectAll,
  allSelected,
  disabled,
  getDisplayName,
  getDescription,
}: DataSetSelectionPanelProps<T>) {
  const filteredItems = items.filter(item => {
    const displayName = getDisplayName(item).toLowerCase();
    const description = getDescription(item)?.toLowerCase() || '';
    return displayName.includes(filter.toLowerCase()) || description.includes(filter.toLowerCase());
  });

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-foreground)] rounded-lg shadow p-6 flex flex-col lg:min-h-0 max-h-[768px] lg:max-h-none">
      <h2 className="text-xl font-semibold text-[var(--color-foreground)] mb-4">{title}</h2>
      {items.length === 0 ? (
        <InfoMessage message={`No ${title.toLowerCase()} available. Create ${title.toLowerCase()} first.`} />
      ) : (
        <>
          <Input
            type="text"
            placeholder={`Filter ${title.toLowerCase()}...`}
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="mb-3"
          />
          <div className="mb-2">
            <button
              onClick={onSelectAll}
              className="text-sm text-[var(--color-accent)] hover:opacity-80 font-medium"
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto lg:min-h-0">
            {filteredItems.length === 0 ? (
              <InfoMessage message={`No ${title.toLowerCase()} match the filter.`} />
            ) : (
              filteredItems.map((item) => {
                const id = item.id;
                const isSelected = selectedIds.has(id);
                const isDisabled = disabled || false;

                return (
                  <div
                    key={id}
                    className={`flex items-start p-3 rounded-md border transition-colors ${
                      isSelected
                        ? 'border-[var(--color-accent)] bg-[var(--color-surface-muted)]'
                        : isDisabled
                        ? 'border-[var(--color-border)] opacity-50'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-muted)]'
                    }`}
                  >
                    <label className="flex items-start flex-1 cursor-pointer">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onToggle(id)}
                        disabled={isDisabled}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-[var(--color-foreground)]">
                          {getDisplayName(item)}
                        </div>
                        {getDescription(item) && (
                          <div className="text-sm text-[var(--color-muted-foreground)] mt-1">
                            {getDescription(item)}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
