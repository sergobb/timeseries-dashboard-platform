import { UserRole } from './auth';
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string | null;
    organization?: string | null;
    department?: string | null;
    roles: UserRole[];
  }

  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      middleName?: string | null;
      organization?: string | null;
      department?: string | null;
      roles: UserRole[];
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roles: UserRole[];
  }
}

