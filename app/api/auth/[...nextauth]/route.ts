import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/db/mongodb';
import { UserRole } from '@/types/auth';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const db = await getDatabase();
        const user = await db.collection('users').findOne({ email: credentials.email });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName || null,
          organization: user.organization || null,
          department: user.department || null,
          roles: user.roles || [],
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id);

        const rolesRaw = 'roles' in user ? (user as { roles?: unknown }).roles : undefined;
        token.roles = Array.isArray(rolesRaw)
          ? rolesRaw.filter((r): r is UserRole => typeof r === 'string')
          : [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const tokenWithMeta = token as typeof token & { id: string; roles: UserRole[] };
        session.user.id = tokenWithMeta.id;
        session.user.roles = tokenWithMeta.roles;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export const { GET, POST } = handlers;
