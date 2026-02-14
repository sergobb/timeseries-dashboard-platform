import { getDatabase } from '@/lib/db/mongodb';
import { Tag } from '@/types/tag';
import { ObjectId } from 'mongodb';

export class TagService {
  static async getAll(): Promise<Tag[]> {
    const db = await getDatabase();
    const tags = await db.collection('tags').find({}).sort({ name: 1 }).toArray();
    return tags.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      createdAt: t.createdAt,
    }));
  }

  static async create(name: string): Promise<Tag> {
    const db = await getDatabase();
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Tag name is required');

    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await db.collection('tags').findOne({
      name: { $regex: new RegExp(`^${escaped}$`, 'i') },
    });
    if (existing) {
      return {
        id: existing._id.toString(),
        name: existing.name,
        createdAt: existing.createdAt,
      };
    }

    const result = await db.collection('tags').insertOne({
      name: trimmed,
      createdAt: new Date(),
    });

    return {
      id: result.insertedId.toString(),
      name: trimmed,
      createdAt: new Date(),
    };
  }
}
