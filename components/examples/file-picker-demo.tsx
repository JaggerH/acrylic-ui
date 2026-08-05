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
