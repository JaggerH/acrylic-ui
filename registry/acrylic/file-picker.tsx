"use client"

import * as React from "react"
import { FileIcon, FolderIcon, FolderPlusIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/acrylic/breadcrumb"
import { Button } from "@/registry/acrylic/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/acrylic/input-group"
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
  selectionEmpty: string
  searchLocal: string
  searchSubtree: string
  newFolder: string
  newFolderPlaceholder: string
  nameRequired: string
  nameTaken: string
}

export const DEFAULT_FILE_BROWSER_LABELS: FileBrowserLabels = {
  root: "All files",
  loading: "Loading…",
  empty: "This folder is empty",
  noMatches: "No matches",
  selectionEmpty: "Nothing selected",
  searchLocal: "Search this folder…",
  searchSubtree: "Search everything below…",
  newFolder: "New folder",
  newFolderPlaceholder: "Folder name",
  nameRequired: "Name required",
  nameTaken: "That name is taken",
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

export type FileSelectMode = "dir" | "file" | "any"

export type FileBrowserProps = {
  loadDir: (path: string) => Promise<FileEntry[]>
  /**
   * Search across the subtree rooted at `path`. When omitted, the search box
   * still appears but falls back to filtering only the entries already
   * loaded for the current level.
   *
   * The `name` of each returned entry must be a path *relative to `path`*
   * (e.g. "Season 3/ep05.mp4"), not a bare filename — otherwise two same-
   * named files in different subdirectories would be indistinguishable in
   * the results, and a selection could not be joined back into a correct
   * absolute path.
   */
  searchDir?: (path: string, query: string) => Promise<FileEntry[]>
  /**
   * Create a subfolder of `parentPath`. Omit to hide the new-folder affordance
   * entirely — no disabled button, since there is nothing useful to disable it
   * *for*. Reject with a message meant for display: the host is the only party
   * that knows its own illegal-character rules, so that check lives there and
   * its failure message is shown verbatim next to the still-open draft row.
   */
  onCreateFolder?: (parentPath: string, name: string) => Promise<void>
  defaultPath?: string
  path?: string
  onPathChange?: (path: string) => void
  /** Which kind of entry can become `value`. Files still render under 'dir' — as read-only context. */
  select?: FileSelectMode
  value?: string | null
  /** `entry` is null when the selected level was not reached from a row (initial path, breadcrumb jump). */
  onValueChange?: (path: string | null, entry: FileEntry | null) => void
  labels?: Partial<FileBrowserLabels>
  className?: string
}

function FileBrowser({
  loadDir,
  searchDir,
  onCreateFolder,
  defaultPath = "/",
  path: pathProp,
  onPathChange,
  select = "dir",
  value,
  onValueChange,
  labels,
  className,
}: FileBrowserProps) {
  const l = { ...DEFAULT_FILE_BROWSER_LABELS, ...labels }
  const [uncontrolledPath, setUncontrolledPath] = React.useState(defaultPath)
  const path = pathProp ?? uncontrolledPath

  const [entries, setEntries] = React.useState<FileEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Decision 4: with select='dir'|'any' the browsed level IS the selection, so
  // drilling in and picking are one action — no second hit target on a folder row.
  const selectsDir = select === "dir" || select === "any"

  const goTo = React.useCallback(
    (next: string, viaEntry: FileEntry | null) => {
      if (pathProp === undefined) setUncontrolledPath(next)
      onPathChange?.(next)
      if (selectsDir) onValueChange?.(next, viaEntry)
    },
    [pathProp, onPathChange, selectsDir, onValueChange]
  )

  // The initial level is also a selection under select='dir'|'any' — announce it
  // once so the host is never left holding a stale value from before this panel
  // mounted (e.g. a value from a previously-shown picker instance).
  const announcedRef = React.useRef(false)
  React.useEffect(() => {
    if (selectsDir && !announcedRef.current) {
      announcedRef.current = true
      onValueChange?.(path, null)
    }
  }, [selectsDir, path, onValueChange])

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

  const [query, setQuery] = React.useState("")
  const [hits, setHits] = React.useState<FileEntry[] | null>(null)
  const [searchError, setSearchError] = React.useState<string | null>(null)

  const [draft, setDraft] = React.useState<string | null>(null)
  const [draftError, setDraftError] = React.useState<string | null>(null)

  // Switching directories abandons the query — a search is scoped to where
  // you were, and carrying it into a new level has no meaning. This reset
  // must happen synchronously during render (the React "adjust state while
  // rendering" pattern), not in its own effect keyed on `path`: effects run
  // in declaration order within the same commit, so a reset effect here
  // would still run *after* the search effect below on the very render
  // where `path` changes — the search effect would fire once more with the
  // new path but the not-yet-cleared old query, sending the host one
  // spurious searchDir(newPath, oldQuery) call before the reset ever lands.
  // Doing the reset inline during render guarantees `query` is already
  // empty by the time the search effect reads it.
  //
  // The draft folder row rides the same reset for the same reason: it is
  // scoped to the level it was opened on (its dupe-check reads `entries` for
  // *this* path), so arriving at a new level — including the one this draft
  // itself just created, via commitDraft's own goTo — must not leave a
  // stale draft row or error message floating over unrelated entries.
  const [lastPath, setLastPath] = React.useState(path)
  if (path !== lastPath) {
    setLastPath(path)
    setQuery("")
    setHits(null)
    setSearchError(null)
    setDraft(null)
    setDraftError(null)
  }

  // Same reference-stability concern as loadDirRef above: `searchDir` is
  // typically passed as an inline arrow function, so the effect must not key
  // off it directly or every unrelated parent re-render would re-issue the
  // in-flight query.
  const searchDirRef = React.useRef(searchDir)
  searchDirRef.current = searchDir

  React.useEffect(() => {
    const q = query.trim()
    if (!searchDirRef.current || !q) { setHits(null); setSearchError(null); return }
    let alive = true
    searchDirRef.current(path, q)
      .then((r) => { if (alive) { setHits(r); setSearchError(null) } })
      .catch((e: unknown) => {
        // Same principle as the load-failure guard above: a failed search
        // must never look like "no matches" — that reads as "it's really
        // not here" and sends people looking in the wrong place, instead of
        // telling them the search itself broke.
        if (alive) {
          setHits(null)
          setSearchError(e instanceof Error ? e.message : String(e))
        }
      })
    return () => { alive = false }
  }, [path, query])

  const [creating, setCreating] = React.useState(false)

  const commitDraft = React.useCallback(async () => {
    if (!onCreateFolder || draft === null) return
    const name = draft.trim()
    // Locally knowable rules are checked locally — no round trip to learn what we
    // already know. Illegal characters are NOT one of them: every backend has its
    // own set, and guessing one only produces false rejections.
    if (!name) { setDraftError(l.nameRequired); return }
    if (entries.some((e) => e.name === name)) { setDraftError(l.nameTaken); return }

    setCreating(true)
    setDraftError(null)
    try {
      await onCreateFolder(path, name)
      setDraft(null)
      // Reload ourselves rather than requiring the host to hand back the new entry
      // — one fewer convention the host has to get right for this to work. Go
      // through the same ref as the mount-and-load effect (not `loadDir` directly)
      // so an inline arrow-function consumer doesn't force this callback to be
      // rebuilt every render.
      const next = await loadDirRef.current(path)
      setEntries(next)
      // Decision 7: creating a folder means you meant to use it — go inside.
      goTo(joinPath(path, name), { name, isDir: true })
    } catch (e: unknown) {
      // Keep the row alive with the text still in it so the name can be fixed in place.
      setDraftError(e instanceof Error ? e.message : String(e))
    } finally {
      setCreating(false)
    }
  }, [onCreateFolder, draft, entries, path, l.nameRequired, l.nameTaken, goTo])

  const shown = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    // Host-driven subtree search wins when present; otherwise fall back to
    // filtering the entries already loaded for this level.
    const base = hits ?? (q ? entries.filter((e) => e.name.toLowerCase().includes(q)) : entries)
    return [...base].sort((a, b) => Number(b.isDir) - Number(a.isDir))
  }, [entries, hits, query])

  const searching = query.trim().length > 0

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
                    <button type="button" onClick={() => goTo(c.path, null)}>
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

      <div className="flex items-center gap-2">
        <InputGroup className="flex-1">
          <InputGroupInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchDir ? l.searchSubtree : l.searchLocal}
            aria-label={searchDir ? l.searchSubtree : l.searchLocal}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        {onCreateFolder && (
          <Button
            icon
            size="small"
            variant="ghost"
            aria-label={l.newFolder}
            onClick={() => { setDraft(""); setDraftError(null) }}
          >
            <FolderPlusIcon />
          </Button>
        )}
      </div>

      <div
        role="listbox"
        aria-label={l.root}
        className="min-h-[12rem] flex-1 overflow-y-auto scrollbar-mac"
      >
        {draft !== null && (
          <div className="flex flex-col gap-1 px-2 py-1.5">
            <div className="flex items-center gap-2">
              <FolderIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                aria-label={l.newFolder}
                placeholder={l.newFolderPlaceholder}
                value={draft}
                disabled={creating}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); void commitDraft() }
                  if (e.key === "Escape") { e.preventDefault(); setDraft(null); setDraftError(null) }
                }}
                className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
              />
            </div>
            {draftError && <p className="pl-6 text-sm text-destructive">{draftError}</p>}
          </div>
        )}
        {loading ? (
          <div className="flex flex-col gap-1 p-1">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        ) : error ? (
          <p className="px-2 py-3 text-sm text-destructive">{error}</p>
        ) : searching && searchError ? (
          <p className="px-2 py-3 text-sm text-destructive">{searchError}</p>
        ) : shown.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">
            {searching ? l.noMatches : l.empty}
          </p>
        ) : (
          shown.map((entry) => {
            const full = joinPath(path, entry.name)
            // Decision 4: a directory row is always active (drill in), regardless
            // of `select` — it is the file rows whose selectability depends on the
            // mode. Directories stay transparent until touched — the same "flat
            // until hovered" language as every other clickable row in this
            // registry (sidebar, command, select) — while files sit on the
            // recessed `muted` fill that materials.md prescribes for a single
            // nested row, which reads as inert unless this mode makes it pickable.
            const selectable = entry.isDir ? select !== "file" : select !== "dir"
            const isSelected = value != null && value === full
            return (
              <Item
                key={entry.name}
                asChild
                size="xs"
                variant={entry.isDir ? "default" : "muted"}
                selected={isSelected}
                className={cn(
                  "w-full",
                  entry.isDir
                    ? "cursor-pointer hover:bg-[var(--acr-hover)] active:scale-[0.995]"
                    : selectable
                      ? "cursor-pointer active:scale-[0.995]"
                      : "cursor-default"
                )}
              >
                <div
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={!selectable && !entry.isDir ? true : undefined}
                  onClick={() => {
                    if (entry.isDir) { goTo(full, entry); return }
                    if (selectable) onValueChange?.(full, entry)
                  }}
                >
                  <ItemMedia>{entry.isDir ? <FolderIcon /> : <FileIcon />}</ItemMedia>
                  <ItemContent className="min-w-0">
                    <span className="truncate text-sm">{entry.name}</span>
                  </ItemContent>
                </div>
              </Item>
            )
          })
        )}
      </div>

      <div
        data-testid="file-picker-selection"
        className="shrink-0 truncate px-1 text-sm text-muted-foreground"
      >
        {value ?? l.selectionEmpty}
      </div>
    </div>
  )
}

export { FileBrowser }
