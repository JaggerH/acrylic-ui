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

// Acrylic FilePicker — a backend-agnostic filesystem browser/picker. Nothing here
// knows what a "file" physically is: every byte of data arrives through the
// `loadDir` / `searchDir` / `onCreateFolder` callbacks the host supplies, so the
// same component drives a cloud drive, an object store, or an in-memory tree.
//
// Two exports, one family:
//   • FileBrowser       — the shell-less panel. Drop it in a Dialog, a Sheet, a
//                         Popover, or straight into the page. It never closes
//                         anything: it does not know what contains it.
//   • FilePickerDialog  — the ready-made version wrapped in the acrylic Dialog.
//
// Copy: every user-facing string lives in `labels` and defaults to English.
// Override per instance; the registry ships no other language.
//
// Compose:
//   <FileBrowser loadDir={listDir} select="dir" value={path} onValueChange={setPath} />

export type FileEntry = {
  name: string
  isDir: boolean
  /** Opaque host payload echoed back through onValueChange — never read here. */
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

  // Mount-and-load, not open-and-load: a shell-less panel has no `open` prop to
  // key off. Whoever unmounts it forgets everything, which is the correct reset.
  React.useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    loadDir(path)
      .then((r) => { if (alive) setEntries(r) })
      .catch((e: unknown) => {
        // A failed load must never look like an empty folder — that reads as
        // "nothing here" and sends people looking in the wrong place.
        if (alive) { setEntries([]); setError(e instanceof Error ? e.message : String(e)) }
      })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [loadDir, path])

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
                  <BreadcrumbLink asChild>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        goTo(c.path)
                      }}
                    >
                      {c.label}
                    </a>
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
        data-nested-surface="true"
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
            <Item
              key={entry.name}
              asChild
              size="xs"
              className="w-full cursor-default active:scale-[0.995]"
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
