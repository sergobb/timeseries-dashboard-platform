import { auth } from '@/app/api/auth/[...nextauth]/route';
import { UserRole } from '@/types/auth';

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.roles.includes(requiredRole);
}

export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return roles.some(role => user.roles.includes(role));
}
