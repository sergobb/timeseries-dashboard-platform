import type { TimeUnit } from '@/types/data-set';

const SUFFIX_REGEX = /(\d+)([smhd])$/i;
const UNIT_MAP: Record<string, TimeUnit> = {
  s: 'seconds',
  m: 'minutes',
  h: 'hours',
  d: 'days',
};

/**
 * Парсит суффикс имени таблицы (например _1s, _10m, _1h) и возвращает interval и timeUnit.
 * Примеры: altair_coord_1s → { interval: 1, timeUnit: 'seconds' }
 *          meteor_m1_coord_10m → { interval: 10, timeUnit: 'minutes' }
 */
export function parsePreaggregationFromTableName(tableName: string): {
  interval: number;
  timeUnit: TimeUnit;
} | null {
  if (!tableName || typeof tableName !== 'string') return null;
  const match = tableName.match(SUFFIX_REGEX);
  if (!match) return null;
  const interval = parseInt(match[1], 10);
  const unit = UNIT_MAP[match[2].toLowerCase()];
  if (!unit || isNaN(interval) || interval < 1) return null;
  return { interval, timeUnit: unit };
}
