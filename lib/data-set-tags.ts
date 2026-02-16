/**
 * Теги, обозначающие разрешение по времени (1 second, 10 minute, 1 hour и т.п.),
 * не переносятся в дата-сет при автоформировании тегов из источников.
 */
const RESOLUTION_TAG_PATTERN = /^\d+\s*(second|minute|hour|day|sec|min|hr|h|m|d)s?\s*$/i;

export function isResolutionTagName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return RESOLUTION_TAG_PATTERN.test(trimmed);
}
