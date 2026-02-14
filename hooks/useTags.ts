import { useCallback, useEffect, useState } from 'react';
import { Tag } from '@/types/tag';

interface UseTagsReturn {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  createTag: (name: string) => Promise<Tag | null>;
}

export function useTags(): UseTagsReturn {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/tags', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to load tags');
      const data = await response.json();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTag = useCallback(
    async (name: string): Promise<Tag | null> => {
      const trimmed = name.trim();
      if (!trimmed) return null;

      try {
        const response = await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: trimmed }),
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to create tag');
        }
        const tag = await response.json();
        setTags((prev) => {
          const exists = prev.some((t) => t.id === tag.id || t.name.toLowerCase() === tag.name.toLowerCase());
          if (exists) return prev;
          return [...prev, tag].sort((a, b) => a.name.localeCompare(b.name));
        });
        return tag;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create tag');
        return null;
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  return { tags, loading, error, load, createTag };
}
