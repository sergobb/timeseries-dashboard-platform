'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function useRequireAuthRedirect(redirectTo: string = '/login') {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.status === 'unauthenticated') {
      router.push(redirectTo);
    }
  }, [redirectTo, router, session.status]);

  return session;
}

