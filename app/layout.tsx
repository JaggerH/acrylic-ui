import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { appName } from '@/lib/shared';
import { Backdrop } from '@/registry/acrylic/backdrop';

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
        {/* Three themes — the showcase defaults to Acrylic; light/dark are the
            plain (non-frosted) baselines. next-themes writes the theme name as a
            class on <html>, which the scopes in global.css key off. */}
        <RootProvider
          theme={{
            themes: ['light', 'dark', 'acrylic'],
            defaultTheme: 'acrylic',
            enableSystem: false,
            // Fumadocs defaults this to true, which injects `* { transition: none }`
            // on theme change — that also kills the segmented switcher's sliding-pill
            // transition. Keep transitions on so the pill slides (the page colors
            // cross-fade on switch as a side effect).
            disableTransitionOnChange: false,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
