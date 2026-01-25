import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/db/mongodb';
import { User, UserRole } from '@/types/auth';

export class UserService {
  static async getById(id: string): Promise<User | null> {
    const db = await getDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });

    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName || null,
      organization: user.organization || null,
      department: user.department || null,
      roles: user.roles || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static async getAll(): Promise<User[]> {
    const db = await getDatabase();
    const users = await db.collection('users').find({}).toArray();

    return users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName || null,
      organization: user.organization || null,
      department: user.department || null,
      roles: user.roles || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  static async getAllWithRoles(): Promise<User[]> {
    const db = await getDatabase();
    const users = await db.collection('users').find({}).toArray();

    return users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName || null,
      organization: user.organization || null,
      department: user.department || null,
      roles: user.roles || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  static async updateRoles(id: string, roles: UserRole[]): Promise<User | null> {
    const db = await getDatabase();
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          roles,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id.toString(),
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      middleName: result.middleName || null,
      organization: result.organization || null,
      department: result.department || null,
      roles: result.roles || [],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  static async updateProfile(
    id: string,
    updates: {
      firstName: string;
      lastName: string;
      middleName?: string | null;
      organization?: string | null;
      department?: string | null;
    }
  ): Promise<User | null> {
    const db = await getDatabase();

    const updateDoc: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    updateDoc.firstName = updates.firstName;
    updateDoc.lastName = updates.lastName;
    updateDoc.middleName = updates.middleName ?? null;
    updateDoc.organization = updates.organization ?? null;
    updateDoc.department = updates.department ?? null;

    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) return null;

    return {
      id: result._id.toString(),
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      middleName: result.middleName || null,
      organization: result.organization || null,
      department: result.department || null,
      roles: result.roles || [],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }
}
