import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { AcrylicDocsLayout } from '@/components/docs-layout';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <AcrylicDocsLayout tree={source.getPageTree()} baseOptions={baseOptions()}>
      {children}
    </AcrylicDocsLayout>
  );
}
