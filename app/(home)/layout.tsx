import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { ThemeSwitcher } from '@/components/theme-switcher';

export default function Layout({ children }: LayoutProps<'/'>) {
  // Replace Fumadocs' built-in light/dark nav toggle with the 3-way switcher so the
  // landing page can reach Acrylic too. The glass app demo dogfoods the same control
  // in its own header — we keep both so the nav doesn't look like it's missing a toggle.
  return (
    <HomeLayout {...baseOptions()} slots={{ themeSwitch: ThemeSwitcher }}>
      {children}
    </HomeLayout>
  );
}
