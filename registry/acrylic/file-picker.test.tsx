import * as React from "react"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
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
    const user = userEvent.setup()
    const loadDir = makeLoadDir()
    render(<FileBrowser loadDir={loadDir} />)
    const firstRow = await screen.findByRole("option", { name: "Shows" })

    firstRow.focus()
    await user.keyboard("{ArrowRight}")
    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/Shows"))

    await user.keyboard("{ArrowLeft}")
    await waitFor(() => expect(loadDir).toHaveBeenCalledWith("/"))
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
      const user = userEvent.setup()
      const onCreateFolder = vi.fn(async () => {})
      render(<FileBrowser loadDir={makeLoadDir()} onCreateFolder={onCreateFolder} />)

      await user.click(await screen.findByRole("button", { name: "New folder" }))
      await user.type(screen.getByRole("textbox", { name: "New folder" }), "Fresh{Enter}")

      await waitFor(() => expect(onCreateFolder).toHaveBeenCalledTimes(1))
      expect(onCreateFolder).toHaveBeenCalledWith("/", "Fresh")
    })
  })
})
