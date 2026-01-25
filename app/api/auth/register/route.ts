import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/db/mongodb';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  lastName: z.string().trim().min(1).max(100),
  firstName: z.string().trim().min(1).max(100),
  middleName: z.string().trim().max(100).optional(),
  organization: z.string().trim().max(200).optional(),
  department: z.string().trim().max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, lastName, firstName, middleName, organization, department } =
      registerSchema.parse(body);

    const db = await getDatabase();
    
    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      lastName,
      firstName,
      middleName: middleName || null,
      organization: organization || null,
      department: department || null,
      roles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        email,
        lastName,
        firstName,
        middleName: middleName || null,
        organization: organization || null,
        department: department || null,
      },
      { status: 201 }
    );
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

