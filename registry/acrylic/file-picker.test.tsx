import * as React from "react"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { FileBrowser, FilePickerDialog, joinPath, pathCrumbs, type FileEntry } from "./file-picker"

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
  "/Seasons": [
    { name: "Season 1", isDir: true },
    { name: "Season 2", isDir: true },
    { name: "Season 3", isDir: true },
  ],
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

  it("does not navigate when a file row is clicked", async () => {
    const user = userEvent.setup()
    const loadDir = makeLoadDir()
    render(<FileBrowser loadDir={loadDir} />)

    await screen.findByRole("option", { name: "readme.txt" })
    loadDir.mockClear()

    await user.click(screen.getByRole("option", { name: "readme.txt" }))

    // A directory click drives a new loadDir call; a file click must not.
    expect(loadDir).not.toHaveBeenCalled()
    expect(screen.getByRole("option", { name: "readme.txt" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Shows" })).toBeInTheDocument()
  })

  it("jumps back to the root through the breadcrumb, not just an intermediate ancestor", async () => {
    const user = userEvent.setup()
    const loadDir = makeLoadDir()
    render(<FileBrowser loadDir={loadDir} defaultPath="/Shows/Season 3" />)

    await screen.findByRole("option", { name: "ep05.mp4" })
    await user.click(screen.getByRole("button", { name: "All files" }))

    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/"))
    expect(await screen.findByRole("option", { name: "Shows" })).toBeInTheDocument()
    expect(await screen.findByRole("option", { name: "readme.txt" })).toBeInTheDocument()
  })
})

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

  it("select='any': clicking a file selects it", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FileBrowser loadDir={makeLoadDir()} select="any" onValueChange={onValueChange} />)

    await user.click(await screen.findByRole("option", { name: "readme.txt" }))

    expect(onValueChange).toHaveBeenCalledWith(
      "/readme.txt",
      expect.objectContaining({ name: "readme.txt" })
    )
  })

  it("select='any': clicking a directory drills in AND selects it in the same action", async () => {
    const user = userEvent.setup()
    const loadDir = makeLoadDir()
    const onValueChange = vi.fn()
    render(<FileBrowser loadDir={loadDir} select="any" onValueChange={onValueChange} />)

    await user.click(await screen.findByRole("option", { name: "Shows" }))

    // Same click both navigates (new level loaded and rendered)...
    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/Shows"))
    expect(await screen.findByRole("option", { name: "cover.jpg" })).toBeInTheDocument()
    // ...and reports the directory itself as the selection — there is no way
    // under 'any' to select a directory without also entering it.
    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith("/Shows", expect.objectContaining({ name: "Shows" }))
    )
  })

  it("select='any': neither files nor directories are aria-disabled", async () => {
    render(<FileBrowser loadDir={makeLoadDir()} select="any" />)

    const dir = await screen.findByRole("option", { name: "Shows" })
    const file = await screen.findByRole("option", { name: "readme.txt" })
    expect(dir).not.toHaveAttribute("aria-disabled")
    expect(file).not.toHaveAttribute("aria-disabled")
  })

  it("select='any': a breadcrumb jump still reports a selection, with a null entry", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <FileBrowser loadDir={makeLoadDir()} select="any" defaultPath="/Shows/Season 3" onValueChange={onValueChange} />
    )

    await screen.findByRole("option", { name: "ep05.mp4" })
    await user.click(screen.getByRole("button", { name: "Shows" }))

    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("/Shows", null))
  })
})

describe("FileBrowser loadDir reference stability", () => {
  it("does not refetch when the consumer passes a new loadDir reference on every render", async () => {
    // The realistic consumer shape is an inline arrow function
    // (`<FileBrowser loadDir={(p) => api.list(p)} />`), which is a fresh
    // reference on every parent render. If the load effect keys off that
    // reference, an unrelated parent re-render refetches the same directory
    // over and over. `load` below is the stable call counter; each render
    // wraps it in a brand-new arrow function, so only a ref-based fix keeps
    // the call count flat.
    let calls = 0
    const load = async (path: string) => {
      calls += 1
      return TREE[path] ?? []
    }

    const { rerender } = render(<FileBrowser loadDir={(p) => load(p)} />)
    await screen.findAllByRole("option")
    expect(calls).toBe(1)

    for (let i = 0; i < 5; i++) {
      rerender(<FileBrowser loadDir={(p) => load(p)} />)
    }

    // Flush any microtask/effect queue a buggy implementation would have
    // scheduled from the re-renders above.
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(calls).toBe(1)
  })
})

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

describe("FileBrowser searchDir reference stability", () => {
  it("does not refetch when the consumer passes a new searchDir reference on every render", async () => {
    // Same shape as the loadDir reference-stability test above: the
    // realistic consumer passes an inline arrow function
    // (`<FileBrowser searchDir={(p, q) => api.search(p, q)} />`), a fresh
    // reference on every parent render. If the search effect keys off that
    // reference directly instead of via a ref, an unrelated parent
    // re-render while a query is active re-issues the same search over and
    // over.
    //
    // The query is set in one shot (fireEvent.change) rather than typed
    // keystroke-by-keystroke: typing legitimately fires one search per
    // keystroke (the effect is correctly keyed on `query`), which would
    // make the call count meaningless here. This test isolates the other
    // axis — re-renders with a stable query must not add calls.
    let calls = 0
    const search = async (path: string, query: string) => {
      calls += 1
      return [{ name: `${query}-hit.mp4`, isDir: false }]
    }

    const { rerender } = render(
      <FileBrowser loadDir={makeLoadDir()} searchDir={(p, q) => search(p, q)} />
    )
    await screen.findByRole("option", { name: "Shows" })

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "ep05" } })
    await waitFor(() => expect(calls).toBe(1))

    for (let i = 0; i < 5; i++) {
      rerender(<FileBrowser loadDir={makeLoadDir()} searchDir={(p, q) => search(p, q)} />)
    }

    // Flush any microtask/effect queue a buggy implementation would have
    // scheduled from the re-renders above.
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(calls).toBe(1)
  })
})

describe("FileBrowser query reset on directory change", () => {
  it("does not call searchDir with the new path paired with the stale query", async () => {
    // Regression test for the review finding: "path changed" and "query
    // reset" used to be two separate effects. On the render where `path`
    // changes, the search effect (declared after the reset effect but
    // reading state captured at render time, not post-effect) would still
    // see the *old* query — so it fired one searchDir(newPath, oldQuery)
    // call the host never should have seen, before the reset effect's
    // setQuery("") ever took visible effect.
    const user = userEvent.setup()
    const loadDir = makeLoadDir()
    const searchDir = vi.fn(async () => [])
    render(
      <FileBrowser
        loadDir={loadDir}
        searchDir={searchDir}
        defaultPath="/Shows"
      />
    )

    await screen.findByRole("option", { name: "cover.jpg" })
    await user.type(screen.getByRole("searchbox"), "x")
    await waitFor(() => expect(searchDir).toHaveBeenCalledWith("/Shows", "x"))

    // Navigate via the breadcrumb (always rendered, unlike a directory row
    // which the active query may have filtered out of the list).
    await user.click(screen.getByRole("button", { name: "All files" }))
    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/"))

    expect(searchDir).not.toHaveBeenCalledWith("/", "x")
  })
})

describe("FileBrowser search failure", () => {
  it("shows the search error, not the no-matches label, when searchDir rejects", async () => {
    const user = userEvent.setup()
    const searchDir = vi.fn(async () => {
      throw new Error("search backend down")
    })
    render(<FileBrowser loadDir={makeLoadDir()} searchDir={searchDir} />)

    await screen.findByRole("option", { name: "Shows" })
    await user.type(screen.getByRole("searchbox"), "ep05")

    expect(await screen.findByText("search backend down")).toBeInTheDocument()
    expect(screen.queryByText("No matches")).not.toBeInTheDocument()
  })

  it("clears the search error once the query is cleared", async () => {
    const user = userEvent.setup()
    const searchDir = vi.fn(async () => {
      throw new Error("search backend down")
    })
    render(<FileBrowser loadDir={makeLoadDir()} searchDir={searchDir} />)

    await screen.findByRole("option", { name: "Shows" })
    const box = screen.getByRole("searchbox")
    await user.type(box, "ep05")
    await screen.findByText("search backend down")

    await user.clear(box)
    expect(screen.queryByText("search backend down")).not.toBeInTheDocument()
    expect(await screen.findByRole("option", { name: "Shows" })).toBeInTheDocument()
  })
})

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

describe("FileBrowser folder creation guards against a stale trigger click", () => {
  it("disables the trigger while creating so it cannot clear the in-flight draft, and keeps the text after the host rejects", async () => {
    // Regression test for the review finding: the trigger button's onClick
    // unconditionally does setDraft(""); setDraftError(null) — with no guard,
    // a click while a create request is in flight would blank out the draft
    // text a user just typed, so a subsequent rejection would show the error
    // next to an empty input instead of the text that actually failed.
    const user = userEvent.setup()
    let rejectCreate: ((e: Error) => void) | undefined
    const onCreateFolder = vi.fn(
      () => new Promise<void>((_resolve, reject) => { rejectCreate = reject })
    )
    render(<FileBrowser loadDir={makeLoadDir()} onCreateFolder={onCreateFolder} />)

    await user.click(await screen.findByRole("button", { name: "New folder" }))
    await user.type(screen.getByRole("textbox", { name: "New folder" }), "a:b{Enter}")

    await waitFor(() => expect(onCreateFolder).toHaveBeenCalledWith("/", "a:b"))

    const trigger = screen.getByRole("button", { name: "New folder" })
    expect(trigger).toBeDisabled()

    // A click on a disabled button does not fire its handler — this is the
    // guard actually being exercised, not userEvent being lenient.
    await user.click(trigger)
    expect(screen.getByRole("textbox", { name: "New folder" })).toHaveValue("a:b")

    rejectCreate?.(new Error("name contains an illegal character"))

    expect(await screen.findByText("name contains an illegal character")).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "New folder" })).toHaveValue("a:b")
  })
})

describe("FileBrowser folder creation unmount safety", () => {
  it("does not notify the host of a path/value change after the panel unmounts mid-creation", async () => {
    // Regression test for the review finding: commitDraft's async continuation
    // never checked whether the component was still mounted, unlike the
    // mount-and-load and search effects which both use an `alive` flag. Its
    // post-await work isn't just setState (React drops that safely on an
    // unmounted tree) — it calls goTo, which reaches out to the host's
    // onPathChange/onValueChange directly. Without a mounted guard, a host that
    // unmounts this panel mid-request (e.g. closing the Dialog wrapping it)
    // would still receive a "path changed" notification for a component it no
    // longer considers alive.
    const user = userEvent.setup()
    let resolveCreate: (() => void) | undefined
    const onCreateFolder = vi.fn(
      () => new Promise<void>((resolve) => { resolveCreate = resolve })
    )
    const onPathChange = vi.fn()
    const onValueChange = vi.fn()
    const { unmount } = render(
      <FileBrowser
        loadDir={makeLoadDir()}
        onCreateFolder={onCreateFolder}
        select="dir"
        onPathChange={onPathChange}
        onValueChange={onValueChange}
      />
    )

    await user.click(await screen.findByRole("button", { name: "New folder" }))
    await user.type(screen.getByRole("textbox", { name: "New folder" }), "Fresh{Enter}")

    await waitFor(() => expect(onCreateFolder).toHaveBeenCalledWith("/", "Fresh"))

    // Clear the mount-time announce call so only post-unmount activity counts.
    onPathChange.mockClear()
    onValueChange.mockClear()

    unmount()
    resolveCreate?.()

    // Flush the microtask queue the resolved promise's .then chain runs on.
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(onPathChange).not.toHaveBeenCalled()
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe("FileBrowser folder creation under StrictMode", () => {
  it("still completes the create-folder flow when rendered inside React.StrictMode", async () => {
    // Regression test for the mountedRef StrictMode deadlock: RTL's render()
    // does not wrap in StrictMode by default, so it only ever exercises a
    // real unmount (one cleanup) — the path this bug hides on. StrictMode
    // simulates an extra mount -> unmount -> remount around every effect
    // right after the first real mount, replaying only effect setup/cleanup
    // (never the component function, so a useRef initializer is not
    // reassigned). A mountedRef that is never reset to true in the effect
    // body gets permanently stuck at false by that simulated unmount, even
    // though the component is still very much mounted — so commitDraft's
    // post-await mounted checks would then always bail out here, even
    // though onCreateFolder and the reload both genuinely succeeded.
    const user = userEvent.setup()
    const created: string[] = []
    const loadDir = vi.fn(async (p: string) => {
      if (p === "/Fresh") return []
      return p === "/" ? [...(TREE["/"] ?? []), ...created.map((n) => ({ name: n, isDir: true }))] : (TREE[p] ?? [])
    })
    const onCreateFolder = vi.fn(async (_parent: string, name: string) => { created.push(name) })
    const onPathChange = vi.fn()

    render(
      <React.StrictMode>
        <FileBrowser
          loadDir={loadDir}
          onCreateFolder={onCreateFolder}
          select="dir"
          onPathChange={onPathChange}
        />
      </React.StrictMode>
    )

    await user.click(await screen.findByRole("button", { name: "New folder" }))
    await user.type(screen.getByRole("textbox", { name: "New folder" }), "Fresh{Enter}")

    await waitFor(() => expect(onCreateFolder).toHaveBeenCalledWith("/", "Fresh"))

    // The effects that actually happen after a successful create — reload
    // and drill-in — are exactly what a wedged mountedRef would suppress.
    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/Fresh"))
    await waitFor(() => expect(onPathChange).toHaveBeenCalledWith("/Fresh"))
    expect(screen.queryByRole("textbox", { name: "New folder" })).not.toBeInTheDocument()
  })
})

describe("FileBrowser search box accessible name", () => {
  it("exposes the subtree label as the accessible name when searchDir is provided", async () => {
    render(<FileBrowser loadDir={makeLoadDir()} searchDir={async () => []} />)
    expect(
      await screen.findByRole("searchbox", { name: "Search everything below…" })
    ).toBeInTheDocument()
  })

  it("exposes the local label as the accessible name when searchDir is omitted", async () => {
    render(<FileBrowser loadDir={makeLoadDir()} />)
    expect(
      await screen.findByRole("searchbox", { name: "Search this folder…" })
    ).toBeInTheDocument()
  })
})

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
    const firstRow = await screen.findByRole("option", { name: "Shows" })

    firstRow.focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("option", { name: "readme.txt" })).toHaveFocus()

    await user.keyboard("{ArrowUp}")
    expect(screen.getByRole("option", { name: "Shows" })).toHaveFocus()
  })

  it("ArrowRight enters a directory and ArrowLeft climbs back out", async () => {
    // The second assertion here used to be `expect(loadDir).toHaveBeenCalledWith("/")`,
    // which is true from the moment the component mounts (defaultPath="/" already
    // triggers loadDir("/")) — so it passed whether or not ArrowLeft did anything at
    // all. Asserting the call count and the *last* call actually distinguishes "the
    // mount-time call" from "ArrowLeft climbed back to the root".
    const user = userEvent.setup()
    const loadDir = makeLoadDir()
    render(<FileBrowser loadDir={loadDir} />)
    const firstRow = await screen.findByRole("option", { name: "Shows" })

    firstRow.focus()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/Shows"))
    expect(loadDir).toHaveBeenCalledTimes(2)

    // The focus-restore effect only lands once the new listing has actually
    // rendered; sending ArrowLeft before that would target a keydown at
    // whatever is still focused in the interim (or nothing at all), not the
    // listbox this handler lives on.
    const newFirstRow = await screen.findByRole("option", { name: "Season 3" })
    await waitFor(() => expect(newFirstRow).toHaveFocus())

    await user.keyboard("{ArrowLeft}")
    await waitFor(() => expect(loadDir).toHaveBeenCalledTimes(3))
    expect(loadDir).toHaveBeenLastCalledWith("/")
  })

  it("focus lands on the first row of the new listing after drilling in with ArrowRight, not on body", async () => {
    // Regression test for the review finding: `key={path}` on the listing
    // remounts the row DOM on every navigation, unmounting whatever row was
    // focused and dropping focus to <body> — which is not a descendant of the
    // listbox container the keydown handler lives on, so keyboard input stops
    // reaching the panel entirely until the user blindly Tabs back in.
    const user = userEvent.setup()
    const loadDir = makeLoadDir()
    render(<FileBrowser loadDir={loadDir} />)
    const firstRow = await screen.findByRole("option", { name: "Shows" })

    firstRow.focus()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/Shows"))

    const newFirstRow = await screen.findByRole("option", { name: "Season 3" })
    await waitFor(() => expect(newFirstRow).toHaveFocus())
    expect(document.activeElement).not.toBe(document.body)
  })

  it("a breadcrumb click does not steal focus into the list", async () => {
    // The focus-restore effect must only fire when keyboard navigation (focus
    // already inside the listbox) drove the `goTo` call — a mouse click on a
    // breadcrumb crumb navigates too, but focus at that moment is on the
    // crumb button itself, outside `listRef`, so the new listing's first row
    // must not steal it.
    //
    // Note: the crumb clicked here becomes the *current* page after
    // navigating (it turns into a non-interactive `BreadcrumbPage`, not a
    // link — see `pathCrumbs`/the render below), so the button itself is
    // unmounted and focus naturally reverts to `<body>`, same as a real
    // browser does when a focused element is removed from the DOM. That is
    // unrelated to this bug: the regression this guards against is the list's
    // first row specifically claiming focus, so that is what gets asserted.
    const user = userEvent.setup()
    const loadDir = makeLoadDir()
    render(<FileBrowser loadDir={loadDir} defaultPath="/Shows/Season 3" />)
    await screen.findByRole("option", { name: "ep05.mp4" })

    await user.click(screen.getByRole("button", { name: "Shows" }))

    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/Shows"))
    const rows = await screen.findAllByRole("option")
    expect(rows).toHaveLength(2)

    // Give a buggy unconditional focus-restore effect a chance to run before
    // asserting nothing grabbed focus.
    await new Promise((resolve) => setTimeout(resolve, 0))
    for (const row of rows) expect(row).not.toHaveFocus()
  })

  it("Enter on a file selects it", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FileBrowser loadDir={makeLoadDir()} select="file" onValueChange={onValueChange} />)
    const firstRow = await screen.findByRole("option", { name: "Shows" })

    firstRow.focus()
    await user.keyboard("{ArrowDown}{Enter}")

    expect(onValueChange).toHaveBeenCalledWith("/readme.txt", expect.objectContaining({ name: "readme.txt" }))
  })

  it("ArrowLeft at the root does nothing (no parent to climb to)", async () => {
    const user = userEvent.setup()
    const loadDir = makeLoadDir()
    render(<FileBrowser loadDir={loadDir} />)
    const firstRow = await screen.findByRole("option", { name: "Shows" })

    firstRow.focus()
    loadDir.mockClear()
    await user.keyboard("{ArrowLeft}")

    // Flush any microtask a buggy implementation would have scheduled.
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(loadDir).not.toHaveBeenCalled()
  })

  it("a non-selectable row (a file under select='dir') can still be reached and read by the arrow keys", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<FileBrowser loadDir={makeLoadDir()} select="dir" onValueChange={onValueChange} />)
    const firstRow = await screen.findByRole("option", { name: "Shows" })

    firstRow.focus()
    await user.keyboard("{ArrowDown}")
    const file = screen.getByRole("option", { name: "readme.txt" })
    expect(file).toHaveFocus()
    expect(file).toHaveAttribute("aria-disabled", "true")

    // Enter must not select it — aria-disabled means "present, not activatable".
    await user.keyboard("{Enter}")
    expect(onValueChange).not.toHaveBeenCalledWith("/readme.txt", expect.anything())
  })

  it("changing the query resets the active row, so a stale index does not act on the filtered list", async () => {
    const user = userEvent.setup()
    render(<FileBrowser loadDir={makeLoadDir()} />)
    const firstRow = await screen.findByRole("option", { name: "Shows" })

    firstRow.focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("option", { name: "readme.txt" })).toHaveFocus()

    // Filtering down to a single row must land the cursor back on row 0 of
    // the *new* list, not keep pointing at whatever index 1 used to be.
    await user.type(screen.getByRole("searchbox"), "read")
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1))
    expect(screen.getByRole("option", { name: "readme.txt" })).toHaveAttribute("tabindex", "0")
  })

  it("stays immune to the third way `shown` shrinks: an async searchDir result landing shorter than the client-side filter that stood in while it was pending", async () => {
    // The render-time reset block only clamps `active` on a `path` or
    // `query` change. This is a third case where `shown` shrinks with
    // neither changing: while a searchDir(path, query) call is in flight,
    // `shown` falls back to filtering the entries already loaded for this
    // level (see the `hits ?? …` fallback in the `shown` memo) — a list
    // that can be longer than what the host's subtree search eventually
    // resolves with. If `active` is read unclamped at render time, once it
    // lands past the end of the now-shorter list, no row equals it, so the
    // "exactly one option has tabIndex=0" invariant silently disappears
    // until the next arrow key happens to re-clamp it via focusRow.
    const user = userEvent.setup()
    const loadDir = makeLoadDir()
    let resolveHits: ((v: FileEntry[]) => void) | undefined
    const searchDir = vi.fn(() => new Promise<FileEntry[]>((resolve) => { resolveHits = resolve }))
    render(<FileBrowser loadDir={loadDir} searchDir={searchDir} defaultPath="/Seasons" />)

    const firstRow = await screen.findByRole("option", { name: "Season 1" })

    // One query change, in a single shot, so exactly one searchDir call is
    // in flight (typing keystroke-by-keystroke would fire one per
    // keystroke and make "the" in-flight call ambiguous).
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "season" } })
    // While that call is pending, `hits` is still null, so `shown` falls
    // back to the client-side filter of the already-loaded entries — all
    // three rows still match "season".
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3))

    // Move the roving cursor to the last row of that (soon to be stale)
    // three-row list.
    firstRow.focus()
    await user.keyboard("{ArrowDown}{ArrowDown}")
    expect(screen.getByRole("option", { name: "Season 3" })).toHaveFocus()

    // The host's subtree search lands with a single, shorter result —
    // `active` (2) is now past the end of a 1-row list.
    resolveHits?.([{ name: "Season 2/extras.mp4", isDir: false }])
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1))

    const rows = screen.getAllByRole("option")
    expect(rows.filter((r) => r.getAttribute("tabindex") === "0")).toHaveLength(1)
    expect(rows[0]).toHaveAttribute("tabindex", "0")
  })

  describe("draft folder input isolation", () => {
    // Regression coverage for an integration risk the brief did not
    // anticipate: the new-folder draft <input> (Task 4) renders inside the
    // same role="listbox" container this task attaches onKeyDown to. Without
    // an explicit guard, typing in the draft box would leak into row
    // navigation — Left/Right moving the text cursor would instead be read
    // as "climb out of this folder" / "drill into the active row", and
    // Up/Down (meaningless in a single-line input) would silently reassign
    // the active row and, via ArrowRight-on-Enter's sibling case, the
        // browsed directory out from under a half-typed name.
    it("ArrowUp/ArrowDown/ArrowLeft/ArrowRight inside the draft input do not navigate or move row focus", async () => {
      const user = userEvent.setup()
      const loadDir = makeLoadDir()
      render(<FileBrowser loadDir={loadDir} onCreateFolder={async () => {}} />)

      await user.click(await screen.findByRole("button", { name: "New folder" }))
      const input = screen.getByRole("textbox", { name: "New folder" })
      await user.type(input, "Fresh")
      loadDir.mockClear()

      await user.type(input, "{ArrowLeft}{ArrowRight}{ArrowUp}{ArrowDown}")

      // No directory navigation was triggered...
      expect(loadDir).not.toHaveBeenCalled()
      // ...the input kept the keystrokes/focus instead of losing them to a row...
      expect(input).toHaveFocus()
      expect(input).toHaveValue("Fresh")
      // ...and the roving cursor never moved off row 0.
      expect(screen.getByRole("option", { name: "Shows" })).toHaveAttribute("tabindex", "0")
    })

    it("Enter in the draft input creates the folder exactly once, not a second time via the list handler", async () => {
      // The original version of this test only asserted on onCreateFolder,
      // which stays "called once with the right args" even with the source
      // guard fully disabled: commitDraft is a useCallback closure, so
      // `name`/`path` are captured in the same synchronous tick the Enter
      // keydown fires, before any bubbled duplicate handling could run. What
      // an unguarded bubble actually does is different: it re-reads the
      // *current* onListKeyDown "Enter" branch, which activates whatever row
      // the roving cursor is sitting on (`shown[activeIndex]`) — here, the
      // still-focused-by-default "Shows" row, isDir — as a *second, spurious
      // navigation* via goTo. That is a `loadDir("/Shows")` call and an
      // `onPathChange("/Shows")` call that a correctly guarded flow would
      // never produce, ahead of the real, create-driven `goTo("/Fresh", …)`.
      // Assert on that spurious side effect, not on onCreateFolder.
      const user = userEvent.setup()
      const created: string[] = []
      const loadDir = vi.fn(async (p: string) => {
        if (p === "/Fresh") return []
        return p === "/" ? [...(TREE["/"] ?? []), ...created.map((n) => ({ name: n, isDir: true }))] : (TREE[p] ?? [])
      })
      const onCreateFolder = vi.fn(async (_parent: string, name: string) => { created.push(name) })
      const onPathChange = vi.fn()
      render(
        <FileBrowser
          loadDir={loadDir}
          onCreateFolder={onCreateFolder}
          select="dir"
          onPathChange={onPathChange}
        />
      )

      await user.click(await screen.findByRole("button", { name: "New folder" }))
      loadDir.mockClear()
      await user.type(screen.getByRole("textbox", { name: "New folder" }), "Fresh{Enter}")

      await waitFor(() => expect(onCreateFolder).toHaveBeenCalledTimes(1))
      expect(onCreateFolder).toHaveBeenCalledWith("/", "Fresh")

      // The legitimate, create-driven navigation.
      await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/Fresh"))
      // The guard's actual job: no extra navigation to whatever row the
      // roving cursor happened to be sitting on when Enter was pressed.
      expect(loadDir).not.toHaveBeenCalledWith("/Shows")
      expect(onPathChange).toHaveBeenCalledTimes(1)
      expect(onPathChange).toHaveBeenCalledWith("/Fresh")
    })
  })
})

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

  it("commitOnSelect + select='dir': does not auto-commit on mount or on drilling into a directory", async () => {
    // Regression test: `entry` is null for the mount-time announce (and for a
    // breadcrumb jump) under select='dir'|'any' — the selection there IS a
    // directory (the browsed level itself), it just has no FileEntry object
    // behind it. A naive `!(entry?.isDir ?? false)` reads that null as "not a
    // directory" and commits immediately, which would close this dialog the
    // instant it opens, and again on every drill-down.
    const user = userEvent.setup()
    const onCommit = vi.fn()
    const onOpenChange = vi.fn()
    const loadDir = makeLoadDir()
    render(
      <FilePickerDialog
        open
        commitOnSelect
        onOpenChange={onOpenChange}
        onCommit={onCommit}
        loadDir={loadDir}
        select="dir"
      />
    )

    // The mount-time announce (entry: null) must not self-close the dialog.
    await screen.findByRole("option", { name: "Shows" })
    expect(onCommit).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)

    // Drilling into a directory re-announces the new level (also entry: the
    // FileEntry with isDir: true, or null via a breadcrumb) — still not a commit.
    await user.click(screen.getByRole("option", { name: "Shows" }))
    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/Shows"))
    await screen.findByRole("option", { name: "Season 3" })

    expect(onCommit).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it("does not carry a stale pending selection across a close/reopen cycle", async () => {
    // Regression test: FilePickerDialog itself never unmounts across
    // open/close — only Radix's DialogContent (and the FileBrowser inside
    // it) does, being behind a Presence-gated Portal. The shell's own
    // `pending` state used to survive a close, so reopening showed last
    // time's selection already chosen — confirm enabled, selection bar
    // showing a path the user never touched this time around.
    const user = userEvent.setup()
    const onCommit = vi.fn()
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <FilePickerDialog open onOpenChange={onOpenChange} onCommit={onCommit} loadDir={makeLoadDir()} select="file" />
    )

    await user.click(await screen.findByRole("option", { name: "readme.txt" }))
    expect(screen.getByRole("button", { name: "Choose" })).not.toBeDisabled()
    expect(screen.getByTestId("file-picker-selection")).toHaveTextContent("/readme.txt")

    // The host closes the dialog (e.g. Cancel, or Esc via Radix) without committing.
    rerender(
      <FilePickerDialog open={false} onOpenChange={onOpenChange} onCommit={onCommit} loadDir={makeLoadDir()} select="file" />
    )
    // Reopen with nothing selected this time.
    rerender(
      <FilePickerDialog open onOpenChange={onOpenChange} onCommit={onCommit} loadDir={makeLoadDir()} select="file" />
    )

    await screen.findByRole("option", { name: "Shows" })
    expect(screen.getByRole("button", { name: "Choose" })).toBeDisabled()
    expect(screen.getByTestId("file-picker-selection")).toHaveTextContent("Nothing selected")
  })
})
