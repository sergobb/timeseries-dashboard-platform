import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { ThemeProvider, THEME_STORAGE_KEY } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Timeseries Dashboard Platform",
  description: "Platform for working with timeseries data from external databases",
};

const themeScript = `
(function() {
  try {
    var k = ${JSON.stringify(THEME_STORAGE_KEY)};
    var theme = localStorage.getItem(k) || 'light';
    if (theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var valid = ['light','dark','light-blue','dark-blue'];
    var root = document.documentElement;
    valid.forEach(function(c){ root.classList.remove(c); });
    root.classList.remove('dark');
    if (valid.indexOf(theme) !== -1) {
      root.classList.add(theme);
      if (theme === 'dark' || theme === 'dark-blue') root.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
