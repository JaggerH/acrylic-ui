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
