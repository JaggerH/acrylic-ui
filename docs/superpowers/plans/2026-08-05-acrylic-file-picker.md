# Acrylic File Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给 acrylic registry 加一个后端无关的文件系统浏览/选择组件（`FileBrowser` 无壳核心 + `FilePickerDialog` 薄壳，含新建文件夹），并把 stream 里两个近亲实现的 13 个调用点收编到它上面。

**Architecture:** 单文件一族 `registry/acrylic/file-picker.tsx`。核心持有三样状态（浏览路径、当前目录条目、搜索词），选中值受控，关闭/提交归薄壳。数据全部经回调从宿主取：`loadDir` 必需，`searchDir`/`onCreateFolder` 可选且不给则对应能力不渲染。stream 侧新建一层 `NetdiskPicker.tsx` 适配层把回调绑到 `api.netdisk`，13 个调用点只面对适配层。

**Tech Stack:** React 19 + TypeScript，Tailwind v4 + `--acr-*` token，vitest + @testing-library/react（jsdom），shadcn registry（`shadcn build`），lucide-react。

**Spec:** `docs/superpowers/specs/2026-08-05-acrylic-file-picker-design.md`（决策编号 1–8 在该文件「Decisions (locked)」一节）

## Global Constraints

- **仓库分工**：Task 1–8 在 `/home/jagger/projects/acrylic-ui`（分支 `master`）；Task 9–11 在 `/home/jagger/projects/stream`（分支 `main`）。两个仓库分别提交，绝不混成一个 commit。
- **文案一律英文**：`registry/acrylic/file-picker.tsx` 内零硬编码非英文字符串。所有面向用户的文字走 `labels`，默认值英文。中文只出现在 stream 侧的字典里。
- **禁止 raw color / 禁止 `dark:` 对**：颜色只走 `--acr-*` token 和宿主的语义变量。需要色块用 `bg-[var(--acr-card-nested)]`，不写 `bg-black/5`。
- **禁止 `--text-*` 排版 token**：macOS 字号阶梯不随 registry theme item 分发，组件里引用会在消费者那边解析不到且无回退。用标准 Tailwind 尺寸类（跟随 `breadcrumb.tsx` 的 `text-sm`）。
- **禁止引入 `motion` 依赖**：本组件无任何拖拽手势，动效走 CSS tier 的 `var(--acr-spring-*)` token，不写手挑的 `cubic-bezier` + ms。
- **`dependencies` 只允许 `lucide-react`**；组件间依赖走 `registryDependencies` 的完整 URL。
- **`registry.json` 条目的 `target` 必须是 `components/acrylic/file-picker.tsx`**，否则 `shadcn add` 会把文件丢进宿主的 `components/ui/` 覆盖 stock shadcn。
- **`public/r/*.json` 是 gitignored**，`registry:build` 的产物永远不提交。
- **禁止 `git stash`**（栈跨 worktree 共享）；**禁止 `git commit --amend`** 已交付的提交；push 只在 Task 8 那一步做。
- **stream 侧禁止 `pnpm typecheck` / `pnpm vitest`**：pnpm 包装器的依赖检查会触发 install 并破坏软链的 `node_modules`。一律直接调 `app/node_modules/.bin/tsc` / `app/node_modules/.bin/vitest`。

---

## File Structure

**acrylic-ui（新建）**
- `registry/acrylic/file-picker.tsx` — 组件一族全部源码（`FileBrowser`、`FilePickerDialog`、类型、默认 labels）
- `registry/acrylic/file-picker.test.tsx` — vitest 测试
- `components/examples/file-picker-demo.tsx` — 文档实时预览用的 demo
- `content/docs/components/file-picker.mdx` — 文档页

**acrylic-ui（修改）**
- `registry.json` — 新增一个 item
- `content/docs/components/meta.json` — `pages` 数组加 `"file-picker"`
- `components/examples-map.ts` — 由 `scripts/gen-examples.mjs` 重新生成，不手改
- `.claude/skills/acrylic-ui/SKILL.md` — correspondence 表登记 acrylic-only

**stream（新建）**
- `app/src/components/netdisk/NetdiskPicker.tsx` — 适配层
- `app/src/components/acrylic/file-picker.tsx` — 由 `shadcn add` 装入（vendored）

**stream（修改/删除）**
- 删 `app/src/components/netdisk/NetdiskDirPicker.tsx` + `.test.tsx`
- 删 `app/src/components/netdisk/NetdiskFilePicker.tsx` + `.test.tsx`
- 改 `ReconcilePanel.tsx`(4)、`NetdiskBindings.tsx`(5+2)、`WorkBinding.tsx`(1)、`MusicChannel.tsx`(1)

---

# Phase A — acrylic-ui

## Task 1: 骨架、目录列表、下钻与面包屑

**Files:**
- Create: `registry/acrylic/file-picker.tsx`
- Create: `registry/acrylic/file-picker.test.tsx`
- Modify: `registry.json`

**Interfaces:**
- Consumes: 无（首个任务）
- Produces: `FileEntry`、`FileBrowserLabels`、`DEFAULT_FILE_BROWSER_LABELS`、`FileBrowser`（本任务只实现 `loadDir` / `defaultPath` / `path` / `onPathChange` / `labels` / `className`）、内部工具 `joinPath(base, name)`、`pathCrumbs(path, rootLabel)`

- [ ] **Step 1: 写失败的测试**

创建 `registry/acrylic/file-picker.test.tsx`：

```tsx
import * as React from "react"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { FileBrowser, joinPath, pathCrumbs, type FileEntry } from "./file-picker"

afterEach(cleanup)

const TREE: Record<string, FileEntry[]> = {
  "/": [
    { name: "Shows", isDir: true },
    { name: "readme.txt", isDir: false },
  ],
  "/Shows": [
    { name: "Season 3", isDir: true },
    { name: "cover.jpg", isDir: false },
  ],
  "/Shows/Season 3": [{ name: "ep05.mp4", isDir: false }],
}

function makeLoadDir() {
  return vi.fn(async (path: string) => TREE[path] ?? [])
}

describe("joinPath", () => {
  it("does not double the leading slash at the root", () => {
    expect(joinPath("/", "Shows")).toBe("/Shows")
    expect(joinPath("", "Shows")).toBe("/Shows")
    expect(joinPath("/Shows", "Season 3")).toBe("/Shows/Season 3")
  })
})

describe("pathCrumbs", () => {
  it("always starts at the root and accumulates each segment", () => {
    expect(pathCrumbs("/Shows/Season 3", "All files")).toEqual([
      { label: "All files", path: "/" },
      { label: "Shows", path: "/Shows" },
      { label: "Season 3", path: "/Shows/Season 3" },
    ])
  })
})

describe("FileBrowser browsing", () => {
  it("loads the default path on mount and lists dirs before files", async () => {
    const loadDir = makeLoadDir()
    render(<FileBrowser loadDir={loadDir} />)

    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/"))
    const rows = await screen.findAllByRole("option")
    expect(rows.map((r) => r.textContent)).toEqual(["Shows", "readme.txt"])
  })

  it("drills into a directory when its row is activated", async () => {
    const user = userEvent.setup()
    const loadDir = makeLoadDir()
    render(<FileBrowser loadDir={loadDir} />)

    await user.click(await screen.findByRole("option", { name: "Shows" }))

    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/Shows"))
    expect(await screen.findByRole("option", { name: "Season 3" })).toBeInTheDocument()
  })

  it("jumps back to any ancestor through the breadcrumb", async () => {
    const user = userEvent.setup()
    const loadDir = makeLoadDir()
    render(<FileBrowser loadDir={loadDir} defaultPath="/Shows/Season 3" />)

    await screen.findByRole("option", { name: "ep05.mp4" })
    // 面包屑用 <button>：这些层级切换只改面板内的状态，不导航文档。
    await user.click(screen.getByRole("button", { name: "Shows" }))

    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/Shows"))
    expect(await screen.findByRole("option", { name: "cover.jpg" })).toBeInTheDocument()
  })

  it("renders the empty label when a directory has no entries", async () => {
    render(<FileBrowser loadDir={async () => []} />)
    expect(await screen.findByText("This folder is empty")).toBeInTheDocument()
  })

  it("surfaces a load failure instead of silently showing an empty folder", async () => {
    render(<FileBrowser loadDir={async () => { throw new Error("upstream 502") }} />)
    expect(await screen.findByText("upstream 502")).toBeInTheDocument()
    expect(screen.queryByText("This folder is empty")).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd /home/jagger/projects/acrylic-ui && npx vitest run registry/acrylic/file-picker.test.tsx`
Expected: FAIL — `Failed to resolve import "./file-picker"`

- [ ] **Step 3: 写最小实现**

创建 `registry/acrylic/file-picker.tsx`：

```tsx
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
                    <button type="button" onClick={() => goTo(c.path)}>{c.label}</button>
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd /home/jagger/projects/acrylic-ui && npx vitest run registry/acrylic/file-picker.test.tsx`
Expected: PASS — 7 passed

- [ ] **Step 5: 加 registry.json 条目**

在 `registry.json` 的 `items` 数组里按字母序（`field` 之后、`hover-card` 之前）插入：

```json
{
  "name": "file-picker",
  "type": "registry:component",
  "title": "File Picker",
  "description": "A backend-agnostic filesystem browser and picker. FileBrowser is the shell-less panel (breadcrumb drill-down, in-place folder creation, cross-subtree search); FilePickerDialog is the ready-made acrylic Dialog wrapper. All data arrives through host callbacks, so it drives a cloud drive, an object store, or an in-memory tree without knowing the difference.",
  "dependencies": ["lucide-react"],
  "registryDependencies": [
    "https://acrylic-ui.vercel.app/r/acrylic.json",
    "https://acrylic-ui.vercel.app/r/breadcrumb.json",
    "https://acrylic-ui.vercel.app/r/button.json",
    "https://acrylic-ui.vercel.app/r/dialog.json",
    "https://acrylic-ui.vercel.app/r/input-group.json",
    "https://acrylic-ui.vercel.app/r/item.json",
    "https://acrylic-ui.vercel.app/r/skeleton.json"
  ],
  "files": [
    {
      "path": "registry/acrylic/file-picker.tsx",
      "type": "registry:component",
      "target": "components/acrylic/file-picker.tsx"
    }
  ]
}
```

- [ ] **Step 6: 验证 registry 能构建出正确的 target**

Run: `cd /home/jagger/projects/acrylic-ui && npm run registry:build && node -e "console.log(require('./public/r/file-picker.json').files[0].target)"`
Expected: `✔ Building registry.` 然后打印 `components/acrylic/file-picker.tsx`

- [ ] **Step 7: 提交**

```bash
cd /home/jagger/projects/acrylic-ui
git add registry/acrylic/file-picker.tsx registry/acrylic/file-picker.test.tsx registry.json
git commit -m "feat(file-picker): 骨架——目录列表、下钻、面包屑回跳"
```

---

## Task 2: 选择模型与选中条

**Files:**
- Modify: `registry/acrylic/file-picker.tsx`
- Modify: `registry/acrylic/file-picker.test.tsx`

**Interfaces:**
- Consumes: Task 1 的 `FileBrowser`、`FileEntry`、`joinPath`
- Produces: `FileBrowserProps` 增加 `select?: 'dir' | 'file' | 'any'`、`value?: string | null`、`onValueChange?: (path: string | null, entry: FileEntry | null) => void`；`FileBrowserLabels` 增加 `selectionEmpty: string`

**决策依据（spec 决策 4、5）：** 选中 = 当前焦点对象。选目录时焦点是「当前所处的层」，所以点目录 = 下钻 = 选中，不做双热区。选文件时焦点是被点的文件。`'any'` 模式下点目录仍然是下钻＋选中同一个动作。

- [ ] **Step 1: 写失败的测试**

追加到 `registry/acrylic/file-picker.test.tsx`：

```tsx
describe("FileBrowser selection", () => {
  it("select='dir': the current level IS the value, and it updates on drill-down", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FileBrowser loadDir={makeLoadDir()} select="dir" onValueChange={onValueChange} />)

    await user.click(await screen.findByRole("option", { name: "Shows" }))

    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith("/Shows", expect.objectContaining({ name: "Shows" }))
    )
  })

  it("select='dir': files are shown but not selectable", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FileBrowser loadDir={makeLoadDir()} select="dir" onValueChange={onValueChange} />)

    const file = await screen.findByRole("option", { name: "readme.txt" })
    expect(file).toHaveAttribute("aria-disabled", "true")

    await user.click(file)
    expect(onValueChange).not.toHaveBeenCalledWith("/readme.txt", expect.anything())
  })

  it("select='file': clicking a file selects it; clicking a dir only drills in", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FileBrowser loadDir={makeLoadDir()} select="file" onValueChange={onValueChange} />)

    await user.click(await screen.findByRole("option", { name: "Shows" }))
    expect(onValueChange).not.toHaveBeenCalled()

    await user.click(await screen.findByRole("option", { name: "cover.jpg" }))
    expect(onValueChange).toHaveBeenCalledWith(
      "/Shows/cover.jpg",
      expect.objectContaining({ name: "cover.jpg" })
    )
  })

  it("marks the row matching `value` as selected", async () => {
    render(<FileBrowser loadDir={makeLoadDir()} select="file" value="/readme.txt" />)
    const file = await screen.findByRole("option", { name: "readme.txt" })
    expect(file).toHaveAttribute("aria-selected", "true")
  })

  it("shows the current value in the selection bar, and a placeholder when nothing is picked", async () => {
    const { rerender } = render(<FileBrowser loadDir={makeLoadDir()} select="file" value={null} />)
    expect(await screen.findByTestId("file-picker-selection")).toHaveTextContent("Nothing selected")

    rerender(<FileBrowser loadDir={makeLoadDir()} select="file" value="/readme.txt" />)
    expect(await screen.findByTestId("file-picker-selection")).toHaveTextContent("/readme.txt")
  })

  it("passes a null entry when the selected level was not reached from a row", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <FileBrowser loadDir={makeLoadDir()} select="dir" defaultPath="/Shows/Season 3" onValueChange={onValueChange} />
    )

    await screen.findByRole("option", { name: "ep05.mp4" })
    // 面包屑用 <button>：这些层级切换只改面板内的状态，不导航文档。
    await user.click(screen.getByRole("button", { name: "Shows" }))

    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("/Shows", null))
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd /home/jagger/projects/acrylic-ui && npx vitest run registry/acrylic/file-picker.test.tsx -t "selection"`
Expected: FAIL — 第一条报 `onValueChange` 未被调用（props 还不存在）

- [ ] **Step 3: 写实现**

在 `file-picker.tsx` 里做四处改动。

1) `FileBrowserLabels` 与默认值加一项：

```tsx
export type FileBrowserLabels = {
  root: string
  loading: string
  empty: string
  noMatches: string
  selectionEmpty: string
}

export const DEFAULT_FILE_BROWSER_LABELS: FileBrowserLabels = {
  root: "All files",
  loading: "Loading…",
  empty: "This folder is empty",
  noMatches: "No matches",
  selectionEmpty: "Nothing selected",
}
```

2) `FileBrowserProps` 加三个 prop：

```tsx
export type FileSelectMode = "dir" | "file" | "any"

export type FileBrowserProps = {
  loadDir: (path: string) => Promise<FileEntry[]>
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
```

3) 组件签名加 `select = "dir"`、`value`、`onValueChange`，并把 `goTo` 改成携带来源 entry：

```tsx
  const selectsDir = select === "dir" || select === "any"

  const goTo = React.useCallback(
    (next: string, viaEntry: FileEntry | null) => {
      if (pathProp === undefined) setUncontrolledPath(next)
      onPathChange?.(next)
      // Decision 4: with select='dir'|'any' the browsed level IS the selection,
      // so drilling in and picking are one action — no second hit target.
      if (selectsDir) onValueChange?.(next, viaEntry)
    },
    [pathProp, onPathChange, selectsDir, onValueChange]
  )

  // The initial level is also a selection under select='dir' — announce it once so
  // the host is never left holding a stale value from before this panel mounted.
  const announcedRef = React.useRef(false)
  React.useEffect(() => {
    if (selectsDir && !announcedRef.current) {
      announcedRef.current = true
      onValueChange?.(path, null)
    }
  }, [selectsDir, path, onValueChange])
```

面包屑的跳转改为 `onClick={() => goTo(c.path, null)}`。

4) 行的渲染改为按 `select` 决定可选中性：

```tsx
          shown.map((entry) => {
            const full = joinPath(path, entry.name)
            const selectable = entry.isDir ? select !== "file" : select !== "dir"
            const isSelected = value != null && value === full
            return (
              <Item
                key={entry.name}
                asChild
                size="xs"
                selected={isSelected}
                className={cn(
                  "w-full",
                  selectable || entry.isDir
                    ? "cursor-default active:scale-[0.995]"
                    : "cursor-default opacity-60"
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
```

5) 列表下方加常驻选中条（spec「选中态显示在哪」——选目录时选中的层不在列表里，没有行可高亮）：

```tsx
      <div
        data-testid="file-picker-selection"
        className="shrink-0 truncate px-1 text-sm text-muted-foreground"
      >
        {value ?? l.selectionEmpty}
      </div>
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd /home/jagger/projects/acrylic-ui && npx vitest run registry/acrylic/file-picker.test.tsx`
Expected: PASS — 13 passed

- [ ] **Step 5: 提交**

```bash
cd /home/jagger/projects/acrylic-ui
git add registry/acrylic/file-picker.tsx registry/acrylic/file-picker.test.tsx
git commit -m "feat(file-picker): 选中即当前焦点对象——目录选中就是所处的层"
```

---

## Task 3: 搜索（两种模式与降级）

**Files:**
- Modify: `registry/acrylic/file-picker.tsx`
- Modify: `registry/acrylic/file-picker.test.tsx`

**Interfaces:**
- Consumes: Task 2 的 `FileBrowserProps`
- Produces: `FileBrowserProps` 增加 `searchDir?: (path: string, query: string) => Promise<FileEntry[]>`；`FileBrowserLabels` 增加 `searchLocal: string`、`searchSubtree: string`

**契约（spec 明文）：** `searchDir` 返回条目的 `name` **必须是相对于 `path` 的相对路径**（如 `Season 3/ep05.mp4`），不是裸文件名——否则跨子树结果里同名文件无法区分，选中后也拼不出正确绝对路径。

- [ ] **Step 1: 写失败的测试**

追加到测试文件：

```tsx
describe("FileBrowser search", () => {
  it("without searchDir: filters the already-loaded level, client-side", async () => {
    const user = userEvent.setup()
    render(<FileBrowser loadDir={makeLoadDir()} />)

    await screen.findByRole("option", { name: "Shows" })
    await user.type(screen.getByRole("searchbox"), "read")

    await waitFor(() => expect(screen.queryByRole("option", { name: "Shows" })).not.toBeInTheDocument())
    expect(screen.getByRole("option", { name: "readme.txt" })).toBeInTheDocument()
  })

  it("with searchDir: delegates to the host and shows the returned relative paths", async () => {
    const user = userEvent.setup()
    const searchDir = vi.fn(async () => [{ name: "Season 3/ep05.mp4", isDir: false }])
    render(<FileBrowser loadDir={makeLoadDir()} searchDir={searchDir} select="file" defaultPath="/Shows" />)

    await screen.findByRole("option", { name: "cover.jpg" })
    await user.type(screen.getByRole("searchbox"), "ep05")

    await waitFor(() => expect(searchDir).toHaveBeenCalledWith("/Shows", "ep05"))
    expect(await screen.findByRole("option", { name: "Season 3/ep05.mp4" })).toBeInTheDocument()
  })

  it("selecting a subtree hit joins the relative path onto the browsed path", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <FileBrowser
        loadDir={makeLoadDir()}
        searchDir={async () => [{ name: "Season 3/ep05.mp4", isDir: false }]}
        select="file"
        defaultPath="/Shows"
        onValueChange={onValueChange}
      />
    )

    await screen.findByRole("option", { name: "cover.jpg" })
    await user.type(screen.getByRole("searchbox"), "ep05")
    await user.click(await screen.findByRole("option", { name: "Season 3/ep05.mp4" }))

    expect(onValueChange).toHaveBeenCalledWith("/Shows/Season 3/ep05.mp4", expect.anything())
  })

  it("clearing the query returns to the plain directory listing", async () => {
    const user = userEvent.setup()
    render(<FileBrowser loadDir={makeLoadDir()} />)

    await screen.findByRole("option", { name: "Shows" })
    const box = screen.getByRole("searchbox")
    await user.type(box, "read")
    await waitFor(() => expect(screen.queryByRole("option", { name: "Shows" })).not.toBeInTheDocument())

    await user.clear(box)
    expect(await screen.findByRole("option", { name: "Shows" })).toBeInTheDocument()
  })

  it("shows the no-matches label when a query hits nothing", async () => {
    const user = userEvent.setup()
    render(<FileBrowser loadDir={makeLoadDir()} />)

    await screen.findByRole("option", { name: "Shows" })
    await user.type(screen.getByRole("searchbox"), "zzz")

    expect(await screen.findByText("No matches")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd /home/jagger/projects/acrylic-ui && npx vitest run registry/acrylic/file-picker.test.tsx -t "search"`
Expected: FAIL — `Unable to find an accessible element with the role "searchbox"`

- [ ] **Step 3: 写实现**

1) 顶部加 import：

```tsx
import { FileIcon, FolderIcon, SearchIcon } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/acrylic/input-group"
```

2) labels 加两项：

```tsx
  searchLocal: "Search this folder…",
  searchSubtree: "Search everything below…",
```

（同步加进 `FileBrowserLabels` 类型。）

3) props 加 `searchDir`，组件内加搜索状态与结果解析：

```tsx
  const [query, setQuery] = React.useState("")
  const [hits, setHits] = React.useState<FileEntry[] | null>(null)

  // Switching directories abandons the query — a search is scoped to where you were.
  React.useEffect(() => { setQuery(""); setHits(null) }, [path])

  React.useEffect(() => {
    const q = query.trim()
    if (!searchDir || !q) { setHits(null); return }
    let alive = true
    searchDir(path, q)
      .then((r) => { if (alive) setHits(r) })
      .catch(() => { if (alive) setHits([]) })
    return () => { alive = false }
  }, [searchDir, path, query])

  const shown = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    // Host-driven subtree search wins; otherwise fall back to filtering this level.
    const base = hits ?? (q ? entries.filter((e) => e.name.toLowerCase().includes(q)) : entries)
    return [...base].sort((a, b) => Number(b.isDir) - Number(a.isDir))
  }, [entries, hits, query])

  const searching = query.trim().length > 0
```

4) 面包屑与列表之间插入搜索框（用 InputGroup，不要手搓框再把 Input 样式关掉）：

```tsx
      <InputGroup>
        <InputGroupInput
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchDir ? l.searchSubtree : l.searchLocal}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
```

5) 空态分支改为区分「空目录」和「搜不到」：

```tsx
        ) : shown.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">
            {searching ? l.noMatches : l.empty}
          </p>
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd /home/jagger/projects/acrylic-ui && npx vitest run registry/acrylic/file-picker.test.tsx`
Expected: PASS — 18 passed

- [ ] **Step 5: 提交**

```bash
cd /home/jagger/projects/acrylic-ui
git add registry/acrylic/file-picker.tsx registry/acrylic/file-picker.test.tsx
git commit -m "feat(file-picker): 搜索可降级——给 searchDir 就跨子树，不给就本层过滤"
```

---

## Task 4: 新建文件夹

**Files:**
- Modify: `registry/acrylic/file-picker.tsx`
- Modify: `registry/acrylic/file-picker.test.tsx`

**Interfaces:**
- Consumes: Task 3 的 `FileBrowserProps`
- Produces: `FileBrowserProps` 增加 `onCreateFolder?: (parentPath: string, name: string) => Promise<void>`；`FileBrowserLabels` 增加 `newFolder`、`newFolderPlaceholder`、`nameRequired`、`nameTaken`

**校验分工（spec 明文）：** 空名和重名组件自己拦（当前目录列表在手上）；非法字符归宿主——组件不可能知道 AList / S3 / Windows 各自的禁用字符集。失败时 reject 的消息原样贴在编辑行下面，**行不消失**。

- [ ] **Step 1: 写失败的测试**

追加到测试文件：

```tsx
describe("FileBrowser folder creation", () => {
  it("renders no new-folder affordance when the host gives no callback", async () => {
    render(<FileBrowser loadDir={makeLoadDir()} />)
    await screen.findByRole("option", { name: "Shows" })
    expect(screen.queryByRole("button", { name: "New folder" })).not.toBeInTheDocument()
  })

  it("creates in place, reloads, and enters the new folder", async () => {
    const user = userEvent.setup()
    const created: string[] = []
    const loadDir = vi.fn(async (p: string) => {
      if (p === "/Fresh") return []
      return p === "/" ? [...(TREE["/"] ?? []), ...created.map((n) => ({ name: n, isDir: true }))] : (TREE[p] ?? [])
    })
    const onCreateFolder = vi.fn(async (_parent: string, name: string) => { created.push(name) })

    render(<FileBrowser loadDir={loadDir} onCreateFolder={onCreateFolder} select="dir" />)

    await user.click(await screen.findByRole("button", { name: "New folder" }))
    await user.type(screen.getByRole("textbox", { name: "New folder" }), "Fresh{Enter}")

    await waitFor(() => expect(onCreateFolder).toHaveBeenCalledWith("/", "Fresh"))
    // Decision 7: creating a folder means you meant to use it — go inside.
    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/Fresh"))
  })

  it("rejects an empty name locally, without calling the host", async () => {
    const user = userEvent.setup()
    const onCreateFolder = vi.fn()
    render(<FileBrowser loadDir={makeLoadDir()} onCreateFolder={onCreateFolder} />)

    await user.click(await screen.findByRole("button", { name: "New folder" }))
    await user.type(screen.getByRole("textbox", { name: "New folder" }), "   {Enter}")

    expect(await screen.findByText("Name required")).toBeInTheDocument()
    expect(onCreateFolder).not.toHaveBeenCalled()
  })

  it("rejects a duplicate name locally, without calling the host", async () => {
    const user = userEvent.setup()
    const onCreateFolder = vi.fn()
    render(<FileBrowser loadDir={makeLoadDir()} onCreateFolder={onCreateFolder} />)

    await user.click(await screen.findByRole("button", { name: "New folder" }))
    await user.type(screen.getByRole("textbox", { name: "New folder" }), "Shows{Enter}")

    expect(await screen.findByText("That name is taken")).toBeInTheDocument()
    expect(onCreateFolder).not.toHaveBeenCalled()
  })

  it("keeps the row and shows the host's message when creation fails", async () => {
    const user = userEvent.setup()
    const onCreateFolder = vi.fn(async () => { throw new Error("name contains an illegal character") })
    render(<FileBrowser loadDir={makeLoadDir()} onCreateFolder={onCreateFolder} />)

    await user.click(await screen.findByRole("button", { name: "New folder" }))
    await user.type(screen.getByRole("textbox", { name: "New folder" }), "a:b{Enter}")

    expect(await screen.findByText("name contains an illegal character")).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "New folder" })).toHaveValue("a:b")
  })

  it("Escape abandons the draft row", async () => {
    const user = userEvent.setup()
    render(<FileBrowser loadDir={makeLoadDir()} onCreateFolder={async () => {}} />)

    await user.click(await screen.findByRole("button", { name: "New folder" }))
    await user.type(screen.getByRole("textbox", { name: "New folder" }), "x{Escape}")

    expect(screen.queryByRole("textbox", { name: "New folder" })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd /home/jagger/projects/acrylic-ui && npx vitest run registry/acrylic/file-picker.test.tsx -t "folder creation"`
Expected: FAIL — 第二条起报找不到 `button` name `New folder`（第一条会通过，因为按钮本来就不该在）

- [ ] **Step 3: 写实现**

1) import 加 `FolderPlusIcon`，加 `Button`：

```tsx
import { FileIcon, FolderIcon, FolderPlusIcon, SearchIcon } from "lucide-react"
import { Button } from "@/registry/acrylic/button"
```

2) labels 加四项（同步进类型）：

```tsx
  newFolder: "New folder",
  newFolderPlaceholder: "Folder name",
  nameRequired: "Name required",
  nameTaken: "That name is taken",
```

3) 组件内加草稿状态与提交逻辑：

```tsx
  const [draft, setDraft] = React.useState<string | null>(null)
  const [draftError, setDraftError] = React.useState<string | null>(null)
  const [creating, setCreating] = React.useState(false)

  React.useEffect(() => { setDraft(null); setDraftError(null) }, [path])

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
      // — one fewer convention the host has to get right for this to work.
      const next = await loadDir(path)
      setEntries(next)
      goTo(joinPath(path, name), { name, isDir: true })
    } catch (e: unknown) {
      // Keep the row alive with the text still in it so the name can be fixed in place.
      setDraftError(e instanceof Error ? e.message : String(e))
    } finally {
      setCreating(false)
    }
  }, [onCreateFolder, draft, entries, path, l, loadDir, goTo])
```

4) 搜索框那一行右侧加新建按钮（只在宿主给了回调时渲染）：

```tsx
      <div className="flex items-center gap-2">
        <InputGroup>{/* …Task 3 的搜索框原样… */}</InputGroup>
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
```

5) 列表最上方插入草稿行（Finder 的就地编辑；绝不再弹一个输入框弹窗——薄壳场景下那已经是 Dialog 套 Dialog 套 Dialog）：

```tsx
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
```

注意这段要放在 `loading ? … : error ? …` 的**分支之外**，紧贴滚动容器的开头——草稿行在加载期间也必须留在屏幕上。

- [ ] **Step 4: 跑测试确认通过**

Run: `cd /home/jagger/projects/acrylic-ui && npx vitest run registry/acrylic/file-picker.test.tsx`
Expected: PASS — 24 passed

- [ ] **Step 5: 提交**

```bash
cd /home/jagger/projects/acrylic-ui
git add registry/acrylic/file-picker.tsx registry/acrylic/file-picker.test.tsx
git commit -m "feat(file-picker): 就地新建文件夹——本地拦空名重名，非法字符归宿主"
```

---

## Task 5: 键盘导航与无障碍

**Files:**
- Modify: `registry/acrylic/file-picker.tsx`
- Modify: `registry/acrylic/file-picker.test.tsx`

**Interfaces:**
- Consumes: Task 4 的完整 `FileBrowser`
- Produces: 无新 prop；列表获得 roving tabindex 与方向键行为

**模型：** macOS 打开面板——`↑`/`↓` 移焦点，`→`/`Enter` 进目录，`←` 回上层，`Enter` 在文件上即选中。整个列表**一个** tab stop。

- [ ] **Step 1: 写失败的测试**

```tsx
describe("FileBrowser keyboard", () => {
  it("the whole list is a single tab stop (roving tabindex)", async () => {
    render(<FileBrowser loadDir={makeLoadDir()} />)
    await screen.findByRole("option", { name: "Shows" })

    const rows = screen.getAllByRole("option")
    expect(rows.filter((r) => r.getAttribute("tabindex") === "0")).toHaveLength(1)
    expect(rows[0]).toHaveAttribute("tabindex", "0")
    expect(rows[1]).toHaveAttribute("tabindex", "-1")
  })

  it("ArrowDown/ArrowUp move the active row", async () => {
    const user = userEvent.setup()
    render(<FileBrowser loadDir={makeLoadDir()} />)
    await screen.findByRole("option", { name: "Shows" })

    await user.tab()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("option", { name: "readme.txt" })).toHaveFocus()

    await user.keyboard("{ArrowUp}")
    expect(screen.getByRole("option", { name: "Shows" })).toHaveFocus()
  })

  it("ArrowRight enters a directory and ArrowLeft climbs back out", async () => {
    const user = userEvent.setup()
    const loadDir = makeLoadDir()
    render(<FileBrowser loadDir={loadDir} />)
    await screen.findByRole("option", { name: "Shows" })

    await user.tab()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/Shows"))

    await user.keyboard("{ArrowLeft}")
    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/"))
  })

  it("Enter on a file selects it", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FileBrowser loadDir={makeLoadDir()} select="file" onValueChange={onValueChange} />)
    await screen.findByRole("option", { name: "Shows" })

    await user.tab()
    await user.keyboard("{ArrowDown}{Enter}")

    expect(onValueChange).toHaveBeenCalledWith("/readme.txt", expect.objectContaining({ name: "readme.txt" }))
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd /home/jagger/projects/acrylic-ui && npx vitest run registry/acrylic/file-picker.test.tsx -t "keyboard"`
Expected: FAIL — 第一条报所有行都没有 `tabindex`

- [ ] **Step 3: 写实现**

1) 加活动行索引与列表容器引用：

```tsx
  const [active, setActive] = React.useState(0)
  const listRef = React.useRef<HTMLDivElement>(null)

  // A new listing resets the cursor to the top; keeping a stale index would put
  // focus on an unrelated row after a drill-down.
  React.useEffect(() => { setActive(0) }, [path, query])

  const focusRow = React.useCallback((i: number) => {
    const rows = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')
    if (!rows || rows.length === 0) return
    const next = Math.max(0, Math.min(i, rows.length - 1))
    setActive(next)
    rows[next].focus()
  }, [])

  const parentPath = React.useMemo(() => {
    const segs = path.split("/").filter(Boolean)
    segs.pop()
    return segs.length === 0 ? "/" : `/${segs.join("/")}`
  }, [path])

  const onListKeyDown = (e: React.KeyboardEvent) => {
    const entry = shown[active]
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); focusRow(active + 1); break
      case "ArrowUp": e.preventDefault(); focusRow(active - 1); break
      case "ArrowRight":
        if (entry?.isDir) { e.preventDefault(); goTo(joinPath(path, entry.name), entry) }
        break
      case "ArrowLeft":
        if (path !== "/") { e.preventDefault(); goTo(parentPath, null) }
        break
      case "Enter": {
        if (!entry) break
        e.preventDefault()
        if (entry.isDir) { goTo(joinPath(path, entry.name), entry); break }
        if (select !== "dir") onValueChange?.(joinPath(path, entry.name), entry)
        break
      }
    }
  }
```

2) 滚动容器接上 ref 和键盘处理：

```tsx
      <div
        ref={listRef}
        role="listbox"
        aria-label={l.root}
        data-nested-surface="true"
        onKeyDown={onListKeyDown}
        className="min-h-[12rem] flex-1 overflow-y-auto scrollbar-mac"
      >
```

3) 每个 `role="option"` 的 `<div>` 加 roving tabindex（`i` 是 `shown.map` 的第二个参数，记得把 map 回调签名改成 `(entry, i)`）：

```tsx
                  tabIndex={i === active ? 0 : -1}
                  onFocus={() => setActive(i)}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd /home/jagger/projects/acrylic-ui && npx vitest run registry/acrylic/file-picker.test.tsx`
Expected: PASS — 28 passed

- [ ] **Step 5: 提交**

```bash
cd /home/jagger/projects/acrylic-ui
git add registry/acrylic/file-picker.tsx registry/acrylic/file-picker.test.tsx
git commit -m "feat(file-picker): macOS 打开面板的键盘模型 + roving tabindex"
```

---

## Task 6: 方向性过渡与滚动边缘

**Files:**
- Modify: `registry/acrylic/file-picker.tsx`

**Interfaces:**
- Consumes: Task 5 的完整 `FileBrowser`
- Produces: 无新 prop；内部 `direction` 状态驱动 CSS 过渡

**为什么不写测试：** 这一步只有视觉产物，jsdom 里断言 class 名等于把实现细节钉进测试。行为已被 Task 1–5 覆盖。验证靠 `npm run dev` 目视 + 文档预览。

- [ ] **Step 1: 加方向状态**

在 `goTo` 里记录进出方向（进入子目录 = 从右推入，回上层 = 从左推入；进出同路径，符合「从哪儿消失就从哪儿回来」）：

```tsx
  const [direction, setDirection] = React.useState<"in" | "out">("in")

  const goTo = React.useCallback(
    (next: string, viaEntry: FileEntry | null) => {
      setDirection(next.length >= path.length ? "in" : "out")
      if (pathProp === undefined) setUncontrolledPath(next)
      onPathChange?.(next)
      if (selectsDir) onValueChange?.(next, viaEntry)
    },
    [path, pathProp, onPathChange, selectsDir, onValueChange]
  )
```

- [ ] **Step 2: 列表内容套一层带 key 的过渡容器**

`key={path}` 让每次换目录都是一次真正的挂载，动画才会重放：

```tsx
        <div
          key={path}
          data-direction={direction}
          className={cn(
            "motion-safe:animate-in motion-safe:fade-in",
            "motion-safe:data-[direction=in]:slide-in-from-right-2",
            "motion-safe:data-[direction=out]:slide-in-from-left-2"
          )}
          style={{
            animationDuration: "var(--acr-spring-default-duration)",
            animationTimingFunction: "var(--acr-spring-default)",
          }}
        >
          {/* 列表行 / 空态 / 错误态 */}
        </div>
```

用 `--acr-spring-default`（阻尼 1.0 / 响应 0.4，临界阻尼无过冲）——原地换内容不是手势，不该有回弹。`prefers-reduced-motion` 已在 token 层把曲线塌成 `linear(0,1)`，`motion-safe:` 再兜一层位移。

- [ ] **Step 3: 滚动边缘遮罩取代硬分隔线**

给滚动容器加 mask，只在内容真被滚上去时才在上边缘淡出——1px 线是永远在那儿的装饰，遮罩只在确有内容被盖住时出现：

```tsx
  const [scrolled, setScrolled] = React.useState(false)
```

滚动容器加：

```tsx
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}
        style={
          scrolled
            ? { maskImage: "linear-gradient(to bottom, transparent 0, black 12px)" }
            : undefined
        }
```

- [ ] **Step 4: 目视验证**

Run: `cd /home/jagger/projects/acrylic-ui && npm run dev`
打开 http://localhost:3000/docs/components/file-picker（Task 7 建好文档页后才有内容；本步先在 `npm run dev` 下用任意页面手工挂载组件确认无报错即可）。
Expected: 下钻时内容从右侧淡入，面包屑回跳时从左侧淡入；列表滚动后上边缘出现渐隐，滚回顶部消失。

- [ ] **Step 5: 提交**

```bash
cd /home/jagger/projects/acrylic-ui
git add registry/acrylic/file-picker.tsx
git commit -m "feat(file-picker): 方向性过渡走 spring token + 滚动边缘取代硬分隔线"
```

---

## Task 7: FilePickerDialog 薄壳

**Files:**
- Modify: `registry/acrylic/file-picker.tsx`
- Modify: `registry/acrylic/file-picker.test.tsx`

**Interfaces:**
- Consumes: `FileBrowser`、`FileBrowserProps`、`FileEntry`
- Produces: `FilePickerDialog`、`FilePickerDialogProps`（`FileBrowserProps` + `open`、`onOpenChange`、`commitOnSelect?`、`onCommit?`）；`FileBrowserLabels` 增加 `title`、`cancel`、`confirm`

**决策依据（spec 决策 5）：** 核心不负责关闭——它不知道自己装在什么壳里。确认与关闭全在薄壳。`commitOnSelect` 让「点了就走」（旧 FilePicker 的手感）和「选完按确认」（旧 DirPicker 的手感）共存。

- [ ] **Step 1: 写失败的测试**

```tsx
import { FilePickerDialog } from "./file-picker"

describe("FilePickerDialog", () => {
  it("commits the current value and closes when confirm is pressed", async () => {
    const user = userEvent.setup()
    const onCommit = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <FilePickerDialog
        open
        onOpenChange={onOpenChange}
        onCommit={onCommit}
        loadDir={makeLoadDir()}
        select="dir"
      />
    )

    await user.click(await screen.findByRole("option", { name: "Shows" }))
    await user.click(screen.getByRole("button", { name: "Choose" }))

    expect(onCommit).toHaveBeenCalledWith("/Shows", expect.objectContaining({ name: "Shows" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("commitOnSelect: picking a file commits and closes in one click", async () => {
    const user = userEvent.setup()
    const onCommit = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <FilePickerDialog
        open
        commitOnSelect
        onOpenChange={onOpenChange}
        onCommit={onCommit}
        loadDir={makeLoadDir()}
        select="file"
      />
    )

    await user.click(await screen.findByRole("option", { name: "readme.txt" }))

    expect(onCommit).toHaveBeenCalledWith("/readme.txt", expect.objectContaining({ name: "readme.txt" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("cancel closes without committing", async () => {
    const user = userEvent.setup()
    const onCommit = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <FilePickerDialog open onOpenChange={onOpenChange} onCommit={onCommit} loadDir={makeLoadDir()} />
    )

    await screen.findByRole("option", { name: "Shows" })
    await user.click(screen.getByRole("button", { name: "Cancel" }))

    expect(onCommit).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("confirm is disabled while nothing is selected", async () => {
    render(
      <FilePickerDialog open onOpenChange={vi.fn()} loadDir={makeLoadDir()} select="file" />
    )
    await screen.findByRole("option", { name: "Shows" })
    expect(screen.getByRole("button", { name: "Choose" })).toBeDisabled()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd /home/jagger/projects/acrylic-ui && npx vitest run registry/acrylic/file-picker.test.tsx -t "FilePickerDialog"`
Expected: FAIL — `FilePickerDialog is not exported`

- [ ] **Step 3: 写实现**

1) import Dialog：

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/acrylic/dialog"
```

2) labels 加三项（同步进类型）：

```tsx
  title: "Choose a location",
  cancel: "Cancel",
  confirm: "Choose",
```

3) 薄壳实现：

```tsx
export type FilePickerDialogProps = FileBrowserProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Selecting an entry commits and closes immediately — no confirm button round trip. */
  commitOnSelect?: boolean
  onCommit?: (path: string, entry: FileEntry | null) => void
}

function FilePickerDialog({
  open,
  onOpenChange,
  commitOnSelect,
  onCommit,
  value: valueProp,
  onValueChange,
  labels,
  ...browser
}: FilePickerDialogProps) {
  const l = { ...DEFAULT_FILE_BROWSER_LABELS, ...labels }
  // The shell owns the pending selection so the browser stays purely controlled-or-not
  // from the host's point of view; the host only hears about it on commit.
  const [pending, setPending] = React.useState<{ path: string; entry: FileEntry | null } | null>(null)
  const value = valueProp !== undefined ? valueProp : (pending?.path ?? null)

  const commit = (path: string, entry: FileEntry | null) => {
    onCommit?.(path, entry)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{l.title}</DialogTitle>
          <DialogDescription className="sr-only">{l.title}</DialogDescription>
        </DialogHeader>

        <FileBrowser
          {...browser}
          labels={labels}
          value={value}
          onValueChange={(path, entry) => {
            setPending(path === null ? null : { path, entry })
            onValueChange?.(path, entry)
            if (commitOnSelect && path !== null && !(entry?.isDir ?? false)) commit(path, entry)
          }}
        />

        <DialogFooter>
          <Button variant="ghost" size="small" onClick={() => onOpenChange(false)}>
            {l.cancel}
          </Button>
          <Button
            variant="neutral"
            size="small"
            disabled={!value}
            onClick={() => { if (value) commit(value, pending?.entry ?? null) }}
          >
            {l.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { FileBrowser, FilePickerDialog }
```

注意 `commitOnSelect` 只对**非目录**立即提交：目录的每次下钻都会触发 `onValueChange`，若一并提交，人还没走到目标层弹窗就关了。

- [ ] **Step 4: 跑测试确认通过**

Run: `cd /home/jagger/projects/acrylic-ui && npx vitest run registry/acrylic/file-picker.test.tsx`
Expected: PASS — 32 passed

- [ ] **Step 5: 提交**

```bash
cd /home/jagger/projects/acrylic-ui
git add registry/acrylic/file-picker.tsx registry/acrylic/file-picker.test.tsx
git commit -m "feat(file-picker): Dialog 薄壳——确认与关闭归壳，核心不知道自己装在哪"
```

---

## Task 8: 文档、skill 登记、部署

**Files:**
- Create: `components/examples/file-picker-demo.tsx`
- Create: `content/docs/components/file-picker.mdx`
- Modify: `content/docs/components/meta.json`
- Modify: `components/examples-map.ts`（由脚本生成，不手改）
- Modify: `.claude/skills/acrylic-ui/SKILL.md`

**Interfaces:**
- Consumes: Task 7 的完整导出
- Produces: 已部署的 `https://acrylic-ui.vercel.app/r/file-picker.json`——**Phase B 的前置条件**

- [ ] **Step 1: 写 demo**

创建 `components/examples/file-picker-demo.tsx`：

```tsx
"use client"

import * as React from "react"

import { Button } from "@/registry/acrylic/button"
import { FilePickerDialog, type FileEntry } from "@/registry/acrylic/file-picker"

const TREE: Record<string, FileEntry[]> = {
  "/": [
    { name: "Documents", isDir: true },
    { name: "Music", isDir: true },
    { name: "notes.txt", isDir: false },
  ],
  "/Documents": [
    { name: "Invoices", isDir: true },
    { name: "resume.pdf", isDir: false },
  ],
  "/Documents/Invoices": [{ name: "2026-01.pdf", isDir: false }],
  "/Music": [{ name: "album.flac", isDir: false }],
}

export default function FilePickerDemo() {
  const [open, setOpen] = React.useState(false)
  const [picked, setPicked] = React.useState<string | null>(null)
  const [extra, setExtra] = React.useState<Record<string, FileEntry[]>>({})

  const tree = { ...TREE, ...extra }

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <Button variant="neutral" size="small" onClick={() => setOpen(true)}>
        Choose a folder
      </Button>
      <p className="text-sm text-muted-foreground">
        {picked ? `Picked: ${picked}` : "Nothing picked yet"}
      </p>

      <FilePickerDialog
        open={open}
        onOpenChange={setOpen}
        select="dir"
        loadDir={async (path) => tree[path] ?? []}
        onCreateFolder={async (parent, name) => {
          if (name.includes(":")) throw new Error("A name cannot contain a colon")
          setExtra((prev) => ({
            ...prev,
            [parent]: [...(tree[parent] ?? []), { name, isDir: true }],
            [`${parent === "/" ? "" : parent}/${name}`]: [],
          }))
        }}
        onCommit={(path) => setPicked(path)}
      />
    </div>
  )
}
```

- [ ] **Step 2: 重新生成 examples map**

Run: `cd /home/jagger/projects/acrylic-ui && node scripts/gen-examples.mjs && grep -c file-picker-demo components/examples-map.ts`
Expected: 打印 `2`（一行 import + 一行 entry）。**漏跑这一步预览会渲染空白**——`<ComponentPreview>` 是通过这张 map 解析名字的，不是扫目录。

- [ ] **Step 3: 写文档页**

创建 `content/docs/components/file-picker.mdx`，照 `content/docs/components/badge.mdx` 的骨架，包含：

- frontmatter `title: File Picker` + `description`
- Installation：`npx shadcn add https://acrylic-ui.vercel.app/r/file-picker.json`
- `<ComponentPreview name="file-picker-demo" />`
- Usage 代码块（`FileBrowser` 无壳用法 + `FilePickerDialog` 薄壳用法各一段）
- Anatomy：两个导出的分工，以及「核心不负责关闭」这条为什么存在
- API Reference：两张 props 表
- **Data contract** 一节，必须写明：`searchDir` 返回条目的 `name` 是相对于 `path` 的**相对路径**（`Season 3/ep05.mp4`），不是裸文件名；否则跨子树结果无法区分同名文件、也拼不出绝对路径
- **Validation split** 一节：空名/重名由组件本地拦截，非法字符由宿主 reject 并回消息
- **Localization** 一节：`labels` 键 → 默认值 → 出现位置的表格

- [ ] **Step 4: 注册到侧边栏**

在 `content/docs/components/meta.json` 的 `pages` 数组里，`"field"` 之后插入 `"file-picker"`。

- [ ] **Step 5: 登记进 skill**

编辑 `.claude/skills/acrylic-ui/SKILL.md`：在 correspondence 表底部 acrylic-only 那几行里（`media-box` / `audio-player` 附近）加一行：

```markdown
| — | `file-picker.tsx` | **acrylic-only**: backend-agnostic filesystem browser/picker (FileBrowser + FilePickerDialog) |
```

并在「Component Selection」表里加一行：

```markdown
| Pick a file or folder | `FilePickerDialog`（或无壳的 `FileBrowser`） |
```

- [ ] **Step 6: 全量验证**

```bash
cd /home/jagger/projects/acrylic-ui
npm run test
npm run types:check
npm run registry:build
git status --short
```

Expected: 测试 32 passed；`types:check` 以 `✓ Types generated successfully` 结束且 `tsc` 无输出；`registry:build` 打印 `✔ Building registry.`；`git status` 里**不出现** `public/r/`（gitignored）。

- [ ] **Step 7: 提交并部署**

```bash
cd /home/jagger/projects/acrylic-ui
git add components/examples/file-picker-demo.tsx components/examples-map.ts \
        content/docs/components/file-picker.mdx content/docs/components/meta.json \
        .claude/skills/acrylic-ui/SKILL.md
git commit -m "docs(file-picker): 文档页 + demo + skill 登记"
git push
```

- [ ] **Step 8: 确认部署已生效**

等 Vercel 部署完成后：

Run: `curl -s https://acrylic-ui.vercel.app/r/file-picker.json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).files[0].target))"`
Expected: 打印 `components/acrylic/file-picker.tsx`

**这是 Phase B 的闸门**——registry 从部署站点服务，不是本地 `public/r`。这条不通就别往下走。

---

# Phase B — stream

## Task 9: 装组件并建适配层

**Files:**
- Create: `app/src/components/acrylic/file-picker.tsx`（由 CLI 装入，不手写）
- Create: `app/src/components/netdisk/NetdiskPicker.tsx`
- Create: `app/src/components/netdisk/NetdiskPicker.test.tsx`

**Interfaces:**
- Consumes: 已部署的 `@acrylic/file-picker`；stream 的 `api.netdisk.listFs` / `api.netdisk.mkdir`、`Connection`、`AlistFile`
- Produces: `NetdiskDirPickerDialog`、`NetdiskFilePickerDialog` 两个具名导出，签名见下

**为什么要适配层：** 13 个调用点不该各自面对回调接口。适配层把 `loadDir` / `searchDir` / `onCreateFolder` 一次性绑到 `api.netdisk`，把中文 labels 一次性填好，调用点只管开关和结果。

- [ ] **Step 1: 装组件**

```bash
cd /home/jagger/projects/stream/app
npx shadcn@latest add https://acrylic-ui.vercel.app/r/file-picker.json
```

Expected: 写入 `src/components/acrylic/file-picker.tsx`。**若 CLI 提示要覆盖 `dialog.tsx` / `item.tsx` 等已存在的文件，一律拒绝**——那些是带本地补丁的 vendored 副本，覆盖会静默丢掉补丁。只接受 `file-picker.tsx` 这一个新文件。

- [ ] **Step 2: 确认落点与依赖**

Run: `cd /home/jagger/projects/stream && ls app/src/components/acrylic/file-picker.tsx && git status --short app/src/components/acrylic/`
Expected: 只有 `file-picker.tsx` 一个新增文件（`??`），没有任何已有 acrylic 文件被改动（`M`）。

- [ ] **Step 3: 写失败的测试**

创建 `app/src/components/netdisk/NetdiskPicker.test.tsx`：

```tsx
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { NetdiskDirPickerDialog } from './NetdiskPicker.tsx'
import { api } from '../../lib/api.ts'

vi.mock('../../lib/api.ts', () => ({
  api: { netdisk: { listFs: vi.fn(), mkdir: vi.fn() } },
}))

const listFs = vi.mocked(api.netdisk.listFs)
const mkdir = vi.mocked(api.netdisk.mkdir)

beforeEach(() => {
  listFs.mockReset()
  mkdir.mockReset()
  listFs.mockResolvedValue({ path: '/', files: [{ name: '综艺', isDir: true, size: 0 }] })
  mkdir.mockResolvedValue({ ok: true })
})

describe('NetdiskDirPickerDialog', () => {
  it('用中文文案，不是组件的英文默认值', async () => {
    render(<NetdiskDirPickerDialog open onOpenChange={vi.fn()} onPick={vi.fn()} />)
    expect(await screen.findByRole('button', { name: '选定此目录' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '新建文件夹' })).toBeInTheDocument()
    expect(screen.queryByText('Choose')).not.toBeInTheDocument()
  })

  it('把浏览路径接到 listFs 上', async () => {
    const user = userEvent.setup()
    render(<NetdiskDirPickerDialog open onOpenChange={vi.fn()} onPick={vi.fn()} />)

    await user.click(await screen.findByRole('option', { name: '综艺' }))
    await waitFor(() => expect(listFs).toHaveBeenCalledWith(expect.anything(), '/综艺'))
  })

  it('新建文件夹拼成绝对路径交给 mkdir', async () => {
    const user = userEvent.setup()
    render(<NetdiskDirPickerDialog open onOpenChange={vi.fn()} onPick={vi.fn()} />)

    await user.click(await screen.findByRole('button', { name: '新建文件夹' }))
    await user.type(screen.getByRole('textbox', { name: '新建文件夹' }), '脱口秀{Enter}')

    await waitFor(() => expect(mkdir).toHaveBeenCalledWith(expect.anything(), '/脱口秀'))
  })

  it('确认时把选定的路径回传给 onPick', async () => {
    const user = userEvent.setup()
    const onPick = vi.fn()
    render(<NetdiskDirPickerDialog open onOpenChange={vi.fn()} onPick={onPick} />)

    await user.click(await screen.findByRole('option', { name: '综艺' }))
    await user.click(screen.getByRole('button', { name: '选定此目录' }))

    expect(onPick).toHaveBeenCalledWith('/综艺')
  })
})
```

- [ ] **Step 4: 跑测试确认失败**

Run: `cd /home/jagger/projects/stream/app && ./node_modules/.bin/vitest run src/components/netdisk/NetdiskPicker.test.tsx`
Expected: FAIL — `Failed to resolve import './NetdiskPicker.tsx'`

- [ ] **Step 5: 写适配层**

创建 `app/src/components/netdisk/NetdiskPicker.tsx`：

```tsx
import { FilePickerDialog, type FileEntry, type FileBrowserLabels } from '../acrylic/file-picker.tsx'
import { api, type Connection } from '../../lib/api.ts'

/**
 * 把 acrylic 的 FilePickerDialog 接到 AList 上——13 个调用点只面对这一层。
 *
 * 组件本身对后端一无所知（数据全走回调），所以「AList 怎么列目录、怎么建目录、
 * 中文文案是什么」这些答案只在这里出现一次。调用点改动降到只剩开关和结果。
 */

const ZH: Partial<FileBrowserLabels> = {
  root: '根目录',
  loading: '加载中…',
  empty: '空目录',
  noMatches: '没有匹配项',
  selectionEmpty: '未选择',
  searchLocal: '搜索当前目录…',
  searchSubtree: '搜索这个目录下的全部文件…',
  newFolder: '新建文件夹',
  newFolderPlaceholder: '文件夹名',
  nameRequired: '名字不能为空',
  nameTaken: '这个名字已经被占用',
  title: '选择网盘目录',
  cancel: '取消',
  confirm: '选定此目录',
}

/** AList 条目 → 组件条目。size 塞进 meta 原样带回，组件自己从不读它。 */
function toEntries(files: Array<{ name: string; isDir: boolean; size: number }>): FileEntry[] {
  return files.map((f) => ({ name: f.name, isDir: f.isDir, meta: { size: f.size } }))
}

function joinAbs(base: string, name: string): string {
  return base === '/' || base === '' ? `/${name}` : `${base}/${name}`
}

/** 选一个网盘目录（绑定向导、认领文件夹、音频流挂目录都用它）。 */
export function NetdiskDirPickerDialog({
  apiBase = '',
  open,
  onOpenChange,
  initialPath = '/',
  onPick,
}: {
  apiBase?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  initialPath?: string
  onPick: (path: string) => void
}) {
  const conn: Connection = { baseUrl: apiBase }
  return (
    <FilePickerDialog
      open={open}
      onOpenChange={onOpenChange}
      select="dir"
      defaultPath={initialPath}
      labels={ZH}
      loadDir={async (path) => toEntries((await api.netdisk.listFs(conn, path)).files)}
      onCreateFolder={async (parent, name) => { await api.netdisk.mkdir(conn, joinAbs(parent, name)) }}
      onCommit={(path) => onPick(path)}
    />
  )
}

/** 选一个网盘文件（手动订正某条清单的配对）。点中即提交，和旧行为一致。 */
export function NetdiskFilePickerDialog({
  apiBase = '',
  open,
  onOpenChange,
  dirPath,
  onPick,
}: {
  apiBase?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  dirPath: string
  onPick: (relativeName: string) => void
}) {
  const conn: Connection = { baseUrl: apiBase }
  return (
    <FilePickerDialog
      open={open}
      onOpenChange={onOpenChange}
      select="file"
      commitOnSelect
      defaultPath={dirPath}
      labels={{ ...ZH, title: '选择网盘文件', confirm: '选定此文件' }}
      loadDir={async (path) => toEntries((await api.netdisk.listFs(conn, path)).files)}
      // recursive=1 回来的 name 已经是相对子路径（`更新/837.xxx.mp3`），正是组件要的契约。
      searchDir={async (path) =>
        toEntries((await api.netdisk.listFs(conn, path, { recursive: true, refresh: true })).files)
      }
      onCommit={(path) => {
        // 调用点要的是相对 dirPath 的名字，不是绝对路径。
        onPick(path.startsWith(`${dirPath}/`) ? path.slice(dirPath.length + 1) : path.replace(/^\//, ''))
      }}
    />
  )
}
```

**已知取舍**：`searchDir` 这里忽略了 query，把整棵子树拿回来交给组件本层过滤——AList 没有服务端搜索接口，递归列举就是它能给的全部。这与旧 `NetdiskFilePicker` 的行为一致（它也是 `recursive: true` 一次拉平）。

- [ ] **Step 6: 跑测试确认通过**

Run: `cd /home/jagger/projects/stream/app && ./node_modules/.bin/vitest run src/components/netdisk/NetdiskPicker.test.tsx`
Expected: PASS — 4 passed

- [ ] **Step 7: 类型检查**

Run: `cd /home/jagger/projects/stream/app && ./node_modules/.bin/tsc --noEmit`
Expected: exit 0，无输出

- [ ] **Step 8: 提交**

```bash
cd /home/jagger/projects/stream
git add app/src/components/acrylic/file-picker.tsx app/src/components/netdisk/NetdiskPicker.tsx \
        app/src/components/netdisk/NetdiskPicker.test.tsx
git commit -m "feat(netdisk): 装 @acrylic/file-picker 并建适配层——AList 的答案只出现一次"
```

---

## Task 10: 迁移 13 个调用点

**Files:**
- Modify: `app/src/components/ReconcilePanel.tsx`（4 处 DirPicker：971、983、994、1302 附近）
- Modify: `app/src/components/netdisk/NetdiskBindings.tsx`（5 处 DirPicker：363、424、633、670、862 + 2 处 FilePicker：608、850 附近）
- Modify: `app/src/components/WorkBinding.tsx`（1 处 DirPicker：241 附近）
- Modify: `app/src/components/MusicChannel.tsx`（1 处 DirPicker：2044 附近）

**Interfaces:**
- Consumes: Task 9 的 `NetdiskDirPickerDialog`、`NetdiskFilePickerDialog`
- Produces: 无新接口；旧的 `NetdiskDirPicker` / `NetdiskFilePicker` 在本任务结束后零引用

**行号会随编辑漂移**——每处都用 `grep -n` 重新定位，不要照抄行号。

- [ ] **Step 1: 迁移 DirPicker 的 11 处**

对每个文件：把 import 换成

```tsx
import { NetdiskDirPickerDialog } from './netdisk/NetdiskPicker.tsx'   // ReconcilePanel / WorkBinding / MusicChannel
import { NetdiskDirPickerDialog } from './NetdiskPicker.tsx'           // NetdiskBindings（同目录）
```

把每处 `<NetdiskDirPicker ... />` 改名为 `<NetdiskDirPickerDialog ... />`。**props 完全不变**——适配层刻意保留了 `apiBase` / `open` / `onOpenChange` / `initialPath` / `onPick` 这套签名，所以这一步是纯改名。

Run: `cd /home/jagger/projects/stream && grep -rn "NetdiskDirPicker\b" app/src --include=*.tsx | grep -v NetdiskPicker`
Expected: 无输出（旧名字已经零引用）

- [ ] **Step 2: 迁移 FilePicker 的 2 处**

`NetdiskBindings.tsx` 里那两处 `<NetdiskFilePicker>` 的 props 变化较大，逐项对照：

| 旧 prop | 新写法 |
|---|---|
| `apiBase` / `open` / `onOpenChange` / `dirPath` | 原样保留 |
| `onPick={(file, dirId) => …}` | `onPick={(file) => …}` — 组件只回文件名；`dirId` 从闭包里取（原来就是 `activeDirId || availableDirs?.[0]?.id`） |
| `availableDirs` | **移出组件**：在 `NetdiskFilePickerDialog` 外面自己渲染那个 Select，用它的值决定传进去的 `dirPath` |
| `entryTitle` | 移到调用点自己的说明文字里（组件不再接这个领域概念） |
| `current` / `busy` / `onClear` | 移到调用点：`onClear` 做成弹窗外的一个「清除配对」按钮 |

「切换搜索目录」的 Select 留在 stream 侧是 spec 明确的决定——它是网盘绑定的领域概念，不进通用组件。

- [ ] **Step 3: 确认旧组件零引用**

Run: `cd /home/jagger/projects/stream && grep -rn "NetdiskFilePicker\b" app/src --include=*.tsx | grep -v "NetdiskFilePickerDialog\|NetdiskFilePicker.tsx\|NetdiskFilePicker.test"`
Expected: 无输出

- [ ] **Step 4: 类型检查 + 全量测试**

```bash
cd /home/jagger/projects/stream/app
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/vitest run src/components
```

Expected: `tsc` exit 0；vitest 全绿。**若有测试失败，先确认它是不是本次改动引起的**——去主检出的 `main` 上跑同一条测试对照，别把别人的中间态当成自己的回归。

- [ ] **Step 5: 提交**

```bash
cd /home/jagger/projects/stream
git add app/src/components/ReconcilePanel.tsx app/src/components/netdisk/NetdiskBindings.tsx \
        app/src/components/WorkBinding.tsx app/src/components/MusicChannel.tsx
git commit -m "refactor(netdisk): 13 个调用点改走 NetdiskPicker 适配层"
```

---

## Task 11: 删旧组件并收尾

**Files:**
- Delete: `app/src/components/netdisk/NetdiskDirPicker.tsx`、`NetdiskDirPicker.test.tsx`
- Delete: `app/src/components/netdisk/NetdiskFilePicker.tsx`、`NetdiskFilePicker.test.tsx`
- Modify: `app/src/components/netdisk/NetdiskPicker.test.tsx`（吸收旧测试里仍有价值的场景）

**Interfaces:**
- Consumes: Task 10 完成后的零引用状态
- Produces: 无

- [ ] **Step 1: 抢救旧测试里的场景**

读 `NetdiskDirPicker.test.tsx` 和 `NetdiskFilePicker.test.tsx`，把其中**测的是行为而不是实现**的用例搬进 `NetdiskPicker.test.tsx`（打适配层）。测组件内部结构的（面包屑 DOM、列表项 class）不搬——那些已经由 acrylic 侧 32 条测试覆盖，在这里重复一遍只是把实现细节钉死两次。

- [ ] **Step 2: 删文件**

```bash
cd /home/jagger/projects/stream
git rm app/src/components/netdisk/NetdiskDirPicker.tsx \
       app/src/components/netdisk/NetdiskDirPicker.test.tsx \
       app/src/components/netdisk/NetdiskFilePicker.tsx \
       app/src/components/netdisk/NetdiskFilePicker.test.tsx
```

- [ ] **Step 3: 全量验证**

```bash
cd /home/jagger/projects/stream/app
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/vitest run src/components
```

Expected: `tsc` exit 0；vitest 全绿。

- [ ] **Step 4: 活体验证**

启动后端与前端（`scripts/dev.sh`），在浏览器里走一遍：

1. 网盘绑定向导 → 点「浏览」→ 下钻两层 → 新建一个文件夹 → 确认它建成并自动进入 → 选定
2. 清单里挑一条 → 手动订正配对 → 搜索一个集号 → 确认结果显示的是相对子路径 → 点中即保存并关闭
3. 键盘走一遍：Tab 进列表 → ↑↓ 移动 → → 进目录 → ← 返回

Expected: 三条都通。**新建文件夹是本次新增能力，必须实际建出一个目录才算验过**——AList 的目录列举有约 30 分钟缓存，确认存在要靠「进得去」而不是「列表里看得见」。

- [ ] **Step 5: 提交**

```bash
cd /home/jagger/projects/stream
git add -A app/src/components/netdisk/
git commit -m "refactor(netdisk): 删掉两个旧 picker——能力已收进 @acrylic/file-picker"
```

---

## Self-Review 记录

**Spec 覆盖检查**（逐节对照）：

| spec 章节 | 覆盖它的 Task |
|---|---|
| 决策 1（一族不是一个） | Task 2 的 `select` 三模式 |
| 决策 2（核心无壳 + 薄壳） | Task 1（`FileBrowser`）+ Task 7（`FilePickerDialog`） |
| 决策 3（回调可降级） | Task 3（无 `searchDir` 降级）+ Task 4（无 `onCreateFolder` 不渲染按钮） |
| 决策 4（选中 = 焦点对象） | Task 2 |
| 决策 5（核心不管关闭） | Task 7 |
| 决策 6（不做多选） | 全程无多选 API |
| 决策 7（新建后进入） | Task 4 Step 1 第二条测试 |
| 决策 8（`FileEntry` 最小） | Task 1 类型定义 + Task 9 `toEntries` 把 size 塞 meta |
| 状态归属与数据流 | Task 1（挂载即加载）+ Task 3（换目录清查询） |
| `searchDir` 相对路径契约 | Task 3 三条测试 + Task 8 文档 Data contract 一节 |
| 新建文件夹校验分工 | Task 4 五条测试 |
| 文案与本地化 | Task 1 起每个 Task 同步扩 labels + Task 9 中文字典 |
| UI 与材质替换表 | Task 1（Item/Skeleton/Breadcrumb）+ Task 3（InputGroup）+ Task 4（Button） |
| 滚动边缘 / 方向性动效 | Task 6 |
| 键盘与无障碍 | Task 5 |
| stream 迁移 | Task 9–11 |
| 交付顺序（部署闸门） | Task 8 Step 8 |

**占位符扫描**：无 TBD / TODO / "类似 Task N"。唯一没有完整代码的是 Task 8 Step 3 的 `.mdx`（列了必含小节而非全文）——文档正文按既有 `badge.mdx` 骨架写，逐字给出会把计划撑爆且没有正确性风险。

**类型一致性**：`FileEntry` / `FileBrowserLabels` / `FileBrowserProps` / `FilePickerDialogProps` 在 Task 1→7 逐步扩展，每次扩展都写明「同步进类型」；`joinPath` 在组件内和适配层各有一份（适配层叫 `joinAbs`，避免与 vendored 组件的导出撞名）；`onValueChange(path, entry)` 的签名从 Task 2 定下后不再变。
