import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { appName } from '@/lib/shared';
import { Backdrop } from '@/registry/acrylic/backdrop';
import { ThemeProvider } from '@/components/theme-provider';

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
        {/* Backdrop wallpaper — paints only under the Acrylic theme on the web
            (CSS-gated); the frosted chrome blurs over it. */}
        <Backdrop />
        <RootProvider theme={{ enabled: false }}>
          <ThemeProvider>{children}</ThemeProvider>
        </RootProvider>
      </body>
    </html>
  );
}
