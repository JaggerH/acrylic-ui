"use client"

import * as React from "react"
import { FileIcon, FolderIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/acrylic/breadcrumb"
import { Item, ItemContent, ItemMedia } from "@/registry/acrylic/item"
import { Skeleton } from "@/registry/acrylic/skeleton"

// Acrylic FilePicker — a backend-agnostic filesystem browser. Nothing here knows
// what a "file" physically is: every byte of data arrives through the `loadDir`
// callback the host supplies, so the same component can drive a cloud drive, an
// object store, or an in-memory tree without any change to this file.
//
// One export: FileBrowser — the shell-less panel. Drop it in a Dialog, a Sheet, a
// Popover, or straight into the page. It never closes anything: it does not know
// what contains it.
//
// Copy: every user-facing string lives in `labels` and defaults to English.
// Override per instance; the registry ships no other language.
//
// Compose:
//   <FileBrowser loadDir={listDir} defaultPath="/" onPathChange={setPath} />

export type FileEntry = {
  name: string
  isDir: boolean
  /** Opaque host payload handed back untouched wherever this entry surfaces — never read here. */
  meta?: unknown
}

export type FileBrowserLabels = {
  root: string
  loading: string
  empty: string
  noMatches: string
}

export const DEFAULT_FILE_BROWSER_LABELS: FileBrowserLabels = {
  root: "All files",
  loading: "Loading…",
  empty: "This folder is empty",
  noMatches: "No matches",
}

/** Join a child name onto a directory path without doubling the root slash. */
export function joinPath(base: string, name: string): string {
  return base === "/" || base === "" ? `/${name}` : `${base}/${name}`
}

/** Absolute path → breadcrumb segments, root first. */
export function pathCrumbs(
  path: string,
  rootLabel: string
): Array<{ label: string; path: string }> {
  const crumbs = [{ label: rootLabel, path: "/" }]
  let acc = ""
  for (const seg of path.split("/").filter(Boolean)) {
    acc = `${acc}/${seg}`
    crumbs.push({ label: seg, path: acc })
  }
  return crumbs
}

export type FileBrowserProps = {
  loadDir: (path: string) => Promise<FileEntry[]>
  defaultPath?: string
  path?: string
  onPathChange?: (path: string) => void
  labels?: Partial<FileBrowserLabels>
  className?: string
}

function FileBrowser({
  loadDir,
  defaultPath = "/",
  path: pathProp,
  onPathChange,
  labels,
  className,
}: FileBrowserProps) {
  const l = { ...DEFAULT_FILE_BROWSER_LABELS, ...labels }
  const [uncontrolledPath, setUncontrolledPath] = React.useState(defaultPath)
  const path = pathProp ?? uncontrolledPath

  const [entries, setEntries] = React.useState<FileEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const goTo = React.useCallback(
    (next: string) => {
      if (pathProp === undefined) setUncontrolledPath(next)
      onPathChange?.(next)
    },
    [pathProp, onPathChange]
  )

  // The natural way to pass loadDir is an inline arrow function
  // (`<FileBrowser loadDir={(p) => api.list(p)} />`), which is a new reference on
  // every parent render. Putting that reference in the load effect's dependency
  // array would refetch the same directory on every unrelated parent re-render —
  // the responsibility for a stable callback can't be pushed onto the consumer, so
  // the component holds the latest function in a ref instead and keys the effect
  // on `path` alone. The ref is written during render (not inside an effect) so
  // it is always current by the time the effect below reads it, including on the
  // very first run.
  const loadDirRef = React.useRef(loadDir)
  loadDirRef.current = loadDir

  // Mount-and-load, not open-and-load: a shell-less panel has no `open` prop to
  // key off. Whoever unmounts it forgets everything, which is the correct reset.
  React.useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    loadDirRef.current(path)
      .then((r) => { if (alive) setEntries(r) })
      .catch((e: unknown) => {
        // A failed load must never look like an empty folder — that reads as
        // "nothing here" and sends people looking in the wrong place.
        if (alive) { setEntries([]); setError(e instanceof Error ? e.message : String(e)) }
      })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [path])

  const shown = React.useMemo(
    () => [...entries].sort((a, b) => Number(b.isDir) - Number(a.isDir)),
    [entries]
  )

  const crumbs = pathCrumbs(path, l.root)

  return (
    <div className={cn("flex min-h-0 flex-col gap-2", className)}>
      <Breadcrumb>
        <BreadcrumbList className="gap-1 sm:gap-1.5">
          {crumbs.map((c, i) => (
            <React.Fragment key={c.path}>
              <BreadcrumbItem>
                {i === crumbs.length - 1 ? (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                ) : (
                  // A button, not a link: this crumb navigates the panel's own
                  // browse path, not the document, so it must not read as
                  // "link" to assistive tech, open in a new tab on
                  // ctrl/middle-click, or fall back to a top-of-page jump if
                  // preventDefault ever fails to run (this panel is often
                  // hosted inside a Dialog).
                  <BreadcrumbLink asChild>
                    <button type="button" onClick={() => goTo(c.path)}>
                      {c.label}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {i < crumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div
        role="listbox"
        aria-label={l.root}
        className="min-h-[12rem] flex-1 overflow-y-auto scrollbar-mac"
      >
        {loading ? (
          <div className="flex flex-col gap-1 p-1">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        ) : error ? (
          <p className="px-2 py-3 text-sm text-destructive">{error}</p>
        ) : shown.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">{l.empty}</p>
        ) : (
          shown.map((entry) => (
            // Directories can be activated (drill in) and files can't (selection
            // is a later task), so the two need to read differently at rest, not
            // just on click. Directories stay transparent until touched — the
            // same "flat until hovered" language as every other clickable row in
            // this registry (sidebar, command, select) — while files sit on the
            // recessed `muted` fill that materials.md prescribes for a single
            // nested row, which reads as an inert swatch with no hover promise.
            <Item
              key={entry.name}
              asChild
              size="xs"
              variant={entry.isDir ? "default" : "muted"}
              className={cn(
                "w-full",
                entry.isDir
                  ? "cursor-pointer hover:bg-[var(--acr-hover)] active:scale-[0.995]"
                  : "cursor-default"
              )}
            >
              <div
                role="option"
                aria-selected={false}
                onClick={() => { if (entry.isDir) goTo(joinPath(path, entry.name)) }}
              >
                <ItemMedia>{entry.isDir ? <FolderIcon /> : <FileIcon />}</ItemMedia>
                <ItemContent className="min-w-0">
                  <span className="truncate text-sm">{entry.name}</span>
                </ItemContent>
              </div>
            </Item>
          ))
        )}
      </div>
    </div>
  )
}

export { FileBrowser }
