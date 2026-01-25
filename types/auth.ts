export type UserRole = 'db_admin' | 'metadata_editor' | 'dashboard_creator' | 'public' | 'user_admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  organization?: string | null;
  department?: string | null;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
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

