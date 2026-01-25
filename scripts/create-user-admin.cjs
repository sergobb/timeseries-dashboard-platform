const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const email = 'user_admin';
const password = 'user_admin';
const role = 'user_admin';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const hashedPassword = await bcrypt.hash(password, 10);
  const now = new Date();

  const existingUser = await db.collection('users').findOne({ email });

  if (existingUser) {
    await db.collection('users').updateOne(
      { _id: existingUser._id },
      {
        $set: {
          password: hashedPassword,
          roles: [role],
          updatedAt: now,
        },
      }
    );
  } else {
    await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      firstName: 'user_admin',
      lastName: 'user_admin',
      middleName: null,
      organization: null,
      department: null,
      roles: [role],
      createdAt: now,
      updatedAt: now,
    });
  }

  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
