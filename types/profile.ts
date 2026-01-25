import { UserRole } from './auth';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  organization?: string | null;
  department?: string | null;
  roles: UserRole[];
}
