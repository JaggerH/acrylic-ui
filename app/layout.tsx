import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { appName } from '@/lib/shared';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    // Page tabs read "<Page> - Acrylic" (mirrors shadcn/ui's "<Page> - shadcn/ui").
    template: `%s - ${appName}`,
    default: appName,
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        {/* Three themes — the showcase defaults to Acrylic; light/dark are the
            plain (non-frosted) baselines. next-themes writes the theme name as a
            class on <html>, which the scopes in global.css key off. */}
        <RootProvider
          theme={{
            themes: ['light', 'dark', 'acrylic'],
            defaultTheme: 'acrylic',
            enableSystem: false,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
