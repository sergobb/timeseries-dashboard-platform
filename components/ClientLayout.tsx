'use client';

import { usePathname } from 'next/navigation';
import SessionProvider from './providers/SessionProvider';
import Header from './Header';

const PUBLIC_DASHBOARD_PATH = /^\/dashboards\/[^/]+\/public\/?$/;

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicDashboard = pathname !== null && PUBLIC_DASHBOARD_PATH.test(pathname);

  if (isPublicDashboard) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  return (
    <SessionProvider>
      <div className="flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}

