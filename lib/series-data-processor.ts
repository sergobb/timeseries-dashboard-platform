import { SeriesDataContext } from '@/types/series-data';

interface CacheEntry {
  context: SeriesDataContext;
  timestamp: number;
}

// Локальное кеширование в памяти
const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 минут

/**
 * Генерирует ключ для кеша на основе серии и диапазона дат
 */
function generateCacheKey(context: SeriesDataContext): string {
  const seriesKey = `${context.dataSetId}:${context.xColumnName}:${context.yColumnName}`;
  const dateKey = context.dateRange
    ? `${context.dateRange.from.getTime()}-${context.dateRange.to.getTime()}`
    : 'no-date';
  return `series:${seriesKey}:${dateKey}`;
}

/**
 * Очищает устаревшие записи из кеша
 */
function clearExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > DEFAULT_TTL) {
      cache.delete(key);
    }
  }
}

/**
 * Обрабатывает связанные данные Series -> DataSet -> DataSource -> DatabaseConnection
 * Использует локальное кеширование для избежания повторных вычислений
 * @param context - объект с данными всех связанных сущностей
 * @returns закешированный или обработанный контекст
 */
export function processSeriesData(context: SeriesDataContext): SeriesDataContext {
  // Очищаем устаревшие записи перед проверкой
  clearExpiredEntries();

  const cacheKey = generateCacheKey(context);
  const cached = cache.get(cacheKey);

  // Проверяем кеш и TTL
  if (cached && Date.now() - cached.timestamp < DEFAULT_TTL) {
    return cached.context;
  }

  // TODO: Реализовать обработку данных
  console.log('processSeriesData', context);

  // Сохраняем в кеш
  cache.set(cacheKey, {
    context,
    timestamp: Date.now(),
  });

  return context;
}

/**
 * Очищает весь кеш
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Удаляет конкретную запись из кеша
 */
export function invalidateCache(dataSetId: string, xColumnName?: string, yColumnName?: string): void {
  const prefix = xColumnName && yColumnName ? `series:${dataSetId}:${xColumnName}:${yColumnName}:` : `series:${dataSetId}:`;
  for (const key of cache.keys()) {
    if (key.includes(prefix)) {
      cache.delete(key);
    }
  }
}

