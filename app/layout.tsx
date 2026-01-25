import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Timeseries Dashboard Platform",
  description: "Platform for working with timeseries data from external databases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'light';
                  // Handle legacy 'system' theme
                  let resolvedTheme = theme;
                  if (theme === 'system') {
                    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  const themeClasses = ['light', 'dark', 'light-blue', 'dark-blue'];
                  document.documentElement.classList.remove(...themeClasses, 'dark');
                  if (resolvedTheme === 'dark' || resolvedTheme === 'light' || resolvedTheme === 'light-blue' || resolvedTheme === 'dark-blue') {
                    document.documentElement.classList.add(resolvedTheme);
                  }
                  if (resolvedTheme === 'dark' || resolvedTheme === 'dark-blue') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased h-full">
        <ThemeProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
