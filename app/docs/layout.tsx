import type { CSSProperties } from 'react';
import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      // Full-width layout: collapse Fumadocs' centering gutters so the sidebar is
      // flush to the viewport's left edge (no left blank pushing it right).
      containerProps={{ style: { '--fd-layout-width': '100%' } as CSSProperties }}
    >
      {children}
    </DocsLayout>
  );
}
