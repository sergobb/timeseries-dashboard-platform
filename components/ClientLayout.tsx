'use client';

import SessionProvider from './providers/SessionProvider';
import Header from './Header';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

