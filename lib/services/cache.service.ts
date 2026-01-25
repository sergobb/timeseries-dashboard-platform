import { getDatabase } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  expiresAt: Date;
}

export class CacheService {
  private static readonly DEFAULT_TTL = 3600; // 1 hour in seconds

  static async get<T = unknown>(key: string): Promise<T | null> {
    const db = await getDatabase();
    const entry = await db.collection<CacheEntry<T>>('data_cache').findOne({
      key,
      expiresAt: { $gt: new Date() },
    });

    if (!entry) {
      return null;
    }

    return entry.data;
  }

  static async set<T = unknown>(key: string, data: T, ttlSeconds: number = this.DEFAULT_TTL): Promise<void> {
    const db = await getDatabase();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await db.collection('data_cache').updateOne(
      { key },
      {
        $set: {
          key,
          data,
          expiresAt,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  static async delete(key: string): Promise<void> {
    const db = await getDatabase();
    await db.collection('data_cache').deleteOne({ key });
  }

  static async clearExpired(): Promise<void> {
    const db = await getDatabase();
    await db.collection('data_cache').deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }

  static generateKey(params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `query:${sortedParams}`;
  }
}

