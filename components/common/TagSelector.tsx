'use client';

import { useRef, useState, useMemo } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Tag } from '@/types/tag';
import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Box from '@/components/ui/Box';

interface TagSelectorProps {
  tags: Tag[];
  loading: boolean;
  selectedTagIds: string[];
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
  onCreateTag: (name: string) => Promise<Tag | null>;
}

export default function TagSelector({
  tags,
  loading,
  selectedTagIds,
  onAddTag,
  onRemoveTag,
  onCreateTag,
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedTags = useMemo(
    () => tags.filter((t) => selectedTagIds.includes(t.id)),
    [tags, selectedTagIds]
  );

  const filteredTags = useMemo(() => {
    if (!inputValue.trim()) return tags;
    const q = inputValue.trim().toLowerCase();
    return tags.filter((t) => t.name.toLowerCase().includes(q));
  }, [tags, inputValue]);

  const availableTags = useMemo(
    () => tags.filter((t) => !selectedTagIds.includes(t.id)),
    [tags, selectedTagIds]
  );

  const canAdd = inputValue.trim().length > 0;
  const existingMatch = filteredTags.find(
    (t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()
  );

  const handleAddExisting = (tag: Tag) => {
    if (!selectedTagIds.includes(tag.id)) {
      onAddTag(tag.id);
    }
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleCreateAndAdd = async () => {
    const name = inputValue.trim();
    if (!name || creating) return;

    setCreating(true);
    try {
      const tag = await onCreateTag(name);
      if (tag && !selectedTagIds.includes(tag.id)) {
        onAddTag(tag.id);
      }
      setInputValue('');
    } finally {
      setCreating(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (existingMatch && !selectedTagIds.includes(existingMatch.id)) {
        handleAddExisting(existingMatch);
      } else if (canAdd) {
        handleCreateAndAdd();
      }
    }
  };

  return (
    <Box>
      <Label className="mb-1.5 block">Tags</Label>
      <div className="space-y-2">
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.map((t) => (
              <Badge
                key={t.id}
                variant="info"
                className="group cursor-default pr-1"
              >
                {t.name}
                <button
                  type="button"
                  onClick={() => onRemoveTag(t.id)}
                  className="ml-1 rounded hover:bg-[var(--color-muted)] p-0.5"
                  aria-label={`Remove ${t.name}`}
                >
                  <span className="text-[10px] leading-none">×</span>
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type to filter or add..."
            className="flex-1 min-w-0 text-sm py-1.5"
            disabled={loading}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCreateAndAdd}
            disabled={!canAdd || creating}
          >
            {creating ? '…' : '+ Add'}
          </Button>
          <Popover.Root>
            <Popover.Trigger
              type="button"
              disabled={loading || availableTags.length === 0}
              className="text-sm px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-input)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select…
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="end"
                sideOffset={4}
                className="z-50 max-h-48 w-[min(45rem,90vw)] min-w-[min(100%,20rem)] overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg p-2"
              >
                <div className="flex flex-wrap gap-1.5 max-w-full" style={{ maxWidth: 'min(40rem, 100%)' }}>
                  {availableTags.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onAddTag(t.id)}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] border border-transparent hover:border-[var(--color-border)] whitespace-nowrap shrink-0"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
        {inputValue.trim() && filteredTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {filteredTags.slice(0, 8).map((t) => {
              const selected = selectedTagIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleAddExisting(t)}
                  disabled={selected}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    selected
                      ? 'border-[var(--color-accent)] bg-[var(--color-surface-muted)] opacity-60 cursor-not-allowed'
                      : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Box>
  );
}
