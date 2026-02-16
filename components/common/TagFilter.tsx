'use client';

import { useRef, useState, useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Tag } from '@/types/tag';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';

interface TagFilterProps {
  tags: Tag[];
  loading: boolean;
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
}

export default function TagFilter({
  tags,
  loading,
  selectedTagIds,
  onToggleTag,
}: TagFilterProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const availableTags = useMemo(
    () => tags.filter((t) => !selectedTagIds.includes(t.id)),
    [tags, selectedTagIds]
  );
  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  const filteredTags = useMemo(() => {
    if (!inputValue.trim()) return availableTags;
    const q = inputValue.trim().toLowerCase();
    return availableTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [availableTags, inputValue]);

  const handleAddTag = (tagId: string) => {
    if (!selectedTagIds.includes(tagId)) {
      onToggleTag(tagId);
    }
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const exact = filteredTags.find(
        (t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()
      );
      const toAdd = exact ?? filteredTags[0];
      if (toAdd && !selectedTagIds.includes(toAdd.id)) {
        handleAddTag(toAdd.id);
      }
    }
  };

  if (loading || tags.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-[var(--color-muted-foreground)]">Filter:</span>
        {selectedTags.map((t) => (
          <Badge
            key={t.id}
            variant="info"
            className="group cursor-default pr-1"
          >
            {t.name}
            <button
              type="button"
              onClick={() => onToggleTag(t.id)}
              className="ml-1 rounded hover:bg-[var(--color-muted)] p-0.5"
              aria-label={`Remove ${t.name}`}
            >
              <span className="text-[10px] leading-none">×</span>
            </button>
          </Badge>
        ))}
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger
            type="button"
            className="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-border-muted)] bg-[var(--color-input)]"
          >
            + Add tag
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={4}
              className="z-50 max-h-48 w-[min(45rem,90vw)] min-w-[min(100%,20rem)] overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg p-2"
            >
              {availableTags.length === 0 ? (
                <div className="px-2 py-1 text-xs text-[var(--color-muted-foreground)]">
                  All tags selected
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-w-full" style={{ maxWidth: 'min(40rem, 100%)' }}>
                  {availableTags.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onToggleTag(t.id)}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] border border-transparent hover:border-[var(--color-border)] whitespace-nowrap shrink-0"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <div className="flex flex-col gap-1.5">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type to filter or select tag..."
          className="w-full max-w-xs text-sm py-1.5"
          disabled={loading}
        />
        {inputValue.trim() && filteredTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {filteredTags.slice(0, 8).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleAddTag(t.id)}
                className="text-xs px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-accent)] bg-[var(--color-input)]"
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
