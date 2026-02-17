import { DataSource } from '@/types/data-source';
import { Tag } from '@/types/tag';
import ErrorMessage from '@/components/ErrorMessage';
import PageTitle from '@/components/ui/PageTitle';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DataSetSelectionPanel from '@/components/data-sets/DataSetSelectionPanel';
import TagFilter from '@/components/common/TagFilter';

interface NewDataSetPageContentProps {
  error: string | null;
  hasSelection: boolean;
  dataSetTagNames: string[];
  dataSetTagsFromSources: string[];
  tags: Tag[];
  tagsLoading: boolean;
  filterTagIds: string[];
  toggleFilterTag: (tagId: string) => void;
  filterUnusedOnly: boolean;
  onFilterUnusedOnlyChange: (value: boolean) => void;
  dataSourcesFilteredByTags: DataSource[];
  selectedDataSources: Set<string>;
  dataSourceFilter: string;
  setDataSourceFilter: (value: string) => void;
  toggleDataSource: (id: string) => void;
  selectAllDataSources: () => void;
  dataSetCountBySourceId: Record<string, number>;
  onBack: () => void;
  onNext: () => void;
}

export default function NewDataSetPageContent({
  error,
  hasSelection,
  dataSetTagNames,
  dataSetTagsFromSources,
  tags,
  tagsLoading,
  filterTagIds,
  toggleFilterTag,
  filterUnusedOnly,
  onFilterUnusedOnlyChange,
  dataSourcesFilteredByTags,
  selectedDataSources,
  dataSourceFilter,
  setDataSourceFilter,
  toggleDataSource,
  selectAllDataSources,
  dataSetCountBySourceId,
  onBack,
  onNext,
}: NewDataSetPageContentProps) {
  const getDisplayName = (ds: DataSource) =>
    ds.schemaName ? `${ds.schemaName}.${ds.tableName}` : ds.tableName;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle>Create New Data Set</PageTitle>
        <div className="flex gap-2">
          <Button onClick={onBack} variant="secondary">
            Back
          </Button>
          <Button onClick={onNext} disabled={!hasSelection}>
            Next
          </Button>
        </div>
      </div>
      {error && <ErrorMessage message={error} className="mb-4" />}
      {hasSelection && dataSetTagNames.length > 0 && (
        <div className="mb-4">
          <span className="text-sm font-medium text-[var(--color-foreground)] mr-2">
            Теги дата-сета (по выбранным источникам):
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {dataSetTagNames.map((name, i) => (
              <Badge key={dataSetTagsFromSources[i]} variant="info">
                {name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <div className="mb-6">
        <div className="mb-4 flex flex-row items-start justify-between gap-4 flex-wrap">
          {tags.length > 0 ? (
            <div className="flex-1 min-w-0">
              <TagFilter
                tags={tags}
                loading={tagsLoading}
                selectedTagIds={filterTagIds}
                onToggleTag={toggleFilterTag}
              />
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <label className="flex items-center gap-2 shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={filterUnusedOnly}
              onChange={(e) => onFilterUnusedOnlyChange(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] focus:ring-[var(--color-ring)]"
            />
            <span className="text-sm text-[var(--color-foreground)]">
              Только неиспользуемые
            </span>
          </label>
        </div>
        <DataSetSelectionPanel
          title="Data Sources"
          items={dataSourcesFilteredByTags}
          selectedIds={selectedDataSources}
          filter={dataSourceFilter}
          onFilterChange={setDataSourceFilter}
          onToggle={toggleDataSource}
          onSelectAll={selectAllDataSources}
          allSelected={false}
          disabled={false}
          getDisplayName={getDisplayName}
          getDescription={(ds: DataSource) => ds.description}
          getBadge={(ds: DataSource) => {
            const count = dataSetCountBySourceId[ds.id] ?? 0;
            return count > 0 ? (
              <Badge variant="info" className="shrink-0 ml-2">
                {count} data set{count !== 1 ? 's' : ''}
              </Badge>
            ) : null;
          }}
        />
      </div>
    </>
  );
}
