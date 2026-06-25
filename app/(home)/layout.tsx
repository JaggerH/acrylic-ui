import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { ThemeSwitcher } from '@/components/theme-switcher';

export default function Layout({ children }: LayoutProps<'/'>) {
  // Replace Fumadocs' built-in light/dark nav toggle with the 3-way switcher so the
  // landing page can reach Acrylic too (same control the docs sidebar uses).
  return (
    <HomeLayout {...baseOptions()} slots={{ themeSwitch: ThemeSwitcher }}>
      {children}
    </HomeLayout>
  );
}
