import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { UserRole } from '@/types/auth';

export async function requireAuth(
  request: NextRequest,
  roles?: UserRole[]
): Promise<NextResponse | null> {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (roles && roles.length > 0) {
    const userRoles = session.user.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return NextResponse.json({ 
        error: 'Forbidden',
        message: `Required role: ${roles.join(', ')}, but user has: ${userRoles.join(', ') || 'none'}`
      }, { status: 403 });
    }
  }

  return null;
}
