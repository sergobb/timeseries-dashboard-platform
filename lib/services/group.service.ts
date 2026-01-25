import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/db/mongodb';
import { Group } from '@/types/group';

export class GroupService {
  private static buildOwnerMatch(ownerId: string) {
    const owners: (string | ObjectId)[] = [ownerId];
    if (ObjectId.isValid(ownerId)) {
      owners.push(new ObjectId(ownerId));
    }
    return { $in: owners };
  }

  private static buildOwnerFilter(ownerId: string) {
    const ownerMatch = GroupService.buildOwnerMatch(ownerId);
    return {
      $or: [{ owner: ownerMatch }, { createdBy: ownerMatch }],
    };
  }

  static async create(
    group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Group> {
    const db = await getDatabase();
    const doc = {
      name: group.name,
      description: group.description,
      role: group.role,
      memberIds: group.memberIds,
      owner: group.owner,
      createdBy: group.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('groups').insertOne(doc);

    return {
      id: result.insertedId.toString(),
      ...doc,
    };
  }

  static async getByOwner(ownerId: string): Promise<Group[]> {
    const db = await getDatabase();
    const groups = await db.collection('groups').find({
      ...GroupService.buildOwnerFilter(ownerId),
    }).toArray();

    return groups.map((group) => ({
      id: group._id.toString(),
      name: group.name,
      description: group.description,
      role: group.role,
      memberIds: group.memberIds || [],
      owner: group.owner ?? group.createdBy,
      createdBy: group.createdBy,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    }));
  }

  static async getById(id: string, ownerId: string): Promise<Group | null> {
    const db = await getDatabase();
    const group = await db.collection('groups').findOne({
      _id: new ObjectId(id),
      ...GroupService.buildOwnerFilter(ownerId),
    });

    if (!group) return null;

    return {
      id: group._id.toString(),
      name: group.name,
      description: group.description,
      role: group.role,
      memberIds: group.memberIds || [],
      owner: group.owner ?? group.createdBy,
      createdBy: group.createdBy,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }

  static async update(
    id: string,
    ownerId: string,
    updates: Partial<Omit<Group, 'id' | 'createdAt' | 'createdBy'>>
  ): Promise<Group | null> {
    const db = await getDatabase();
    const updateDoc: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await db.collection('groups').findOneAndUpdate(
      { _id: new ObjectId(id), ...GroupService.buildOwnerFilter(ownerId) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id.toString(),
      name: result.name,
      description: result.description,
      role: result.role,
      memberIds: result.memberIds || [],
      owner: result.owner ?? result.createdBy,
      createdBy: result.createdBy,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  static async delete(id: string, ownerId: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.collection('groups').deleteOne({
      _id: new ObjectId(id),
      ...GroupService.buildOwnerFilter(ownerId),
    });

    return result.deletedCount > 0;
  }
}
