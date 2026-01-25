import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { getDatabase } from '@/lib/db/mongodb';

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = passwordSchema.parse(body);

    const db = await getDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(session.user.id) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
