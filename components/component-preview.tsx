import { readFileSync } from "node:fs"
import { join } from "node:path"
import { examples } from "./examples-map"
import { PreviewTabs } from "./preview-tabs"

/** MDX `<ComponentPreview name="button-demo" />` — renders the named example live
 *  (Preview tab) and shows its source read from disk at build (Code tab). The
 *  example index (examples-map.ts) is generated; source is always the real file. */
export function ComponentPreview({ name }: { name: string }) {
  const Example = examples[name]
  if (!Example) {
    return <p className="text-fd-muted-foreground">Example &quot;{name}&quot; not found.</p>
  }
  let source = ""
  try {
    source = readFileSync(join(process.cwd(), "components", "examples", `${name}.tsx`), "utf8")
  } catch {
    source = `// source unavailable for "${name}"`
  }
  return (
    <PreviewTabs source={source}>
      <Example />
    </PreviewTabs>
  )
}
