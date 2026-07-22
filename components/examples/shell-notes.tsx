"use client"

import * as React from "react"
import { Folder, Maximize2, Minimize2, PenLine, Search } from "lucide-react"

import { ExampleBackdrop } from "@/components/example-backdrop"
import { Button } from "@/registry/acrylic/button"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemSeparator,
  ItemTitle,
} from "@/registry/acrylic/item"
import {
  Shell,
  ShellBody,
  ShellContent,
  ShellInset,
  ShellNavbar,
  ShellNavbarActions,
  ShellNavbarHeading,
  ShellNavbarSubtitle,
  ShellNavbarTitle,
  ShellPanel,
} from "@/registry/acrylic/shell"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/registry/acrylic/sidebar"

const FOLDERS = ["All iCloud", "Acrylic", "Components", "Archive"]
const NOTES = [
  {
    title: "Shell component boundary",
    preview:
      "Shell is a composable layout primitive. App names belong in examples, not exports.",
    body: [
      "A shell describes the app frame: sidebar, inset, panels, navbar, and scrollable content. Users compose those pieces into Mail, Notes, or their own product surface.",
      "Panel headers are for local list metadata. Reading and editing surfaces should let the document title live inside the content.",
    ],
  },
  {
    title: "macOS Mail split view",
    preview:
      "The Mail example reuses the same Item composition for its message list.",
    body: [
      "Density, truncation, and selection come from Item, not from a mail-only row component. Notes should read the same list.",
    ],
  },
  {
    title: "Notes editor padding",
    preview: "The reading pane uses ShellContent padding=\"reading\" for prose margins.",
    body: [
      "The editor column caps its width and relies on ShellContent's reading padding rather than a bespoke max-width wrapper.",
    ],
  },
  {
    title: "Registry docs outline",
    preview: "Shell's API Reference should mirror Card's per-part prop tables.",
    body: [
      "Every Shell sub-part renders a plain element with a data-slot hook and forwards native props — the docs should say so explicitly per part.",
    ],
  },
]

export default function ShellNotes() {
  const [expanded, setExpanded] = React.useState(false)
  const [selectedTitle, setSelectedTitle] = React.useState(NOTES[0].title)
  const ExpandIcon = expanded ? Minimize2 : Maximize2
  const selectedNote =
    NOTES.find((note) => note.title === selectedTitle) ?? NOTES[0]

  return (
    <ExampleBackdrop className={expanded ? "min-h-0" : undefined}>
      <div
        className={
          expanded
            ? "fixed inset-0 z-50 flex bg-background"
            : "relative w-full max-w-5xl"
        }
      >
        <Shell
          variant="inset"
          className={
            expanded
              ? "h-full w-full rounded-none shadow-none dark:shadow-none [&_[data-slot=sidebar]]:rounded-none"
              : "h-[31rem] w-full"
          }
        >
          <Button
            icon
            size="large"
            variant="neutral"
            aria-label={expanded ? "Shrink demo" : "Expand demo"}
            aria-pressed={expanded}
            title={expanded ? "Shrink demo" : "Expand demo"}
            onClick={() => setExpanded((value) => !value)}
            className="absolute bottom-3 left-3 z-20 text-foreground"
          >
            <ExpandIcon />
          </Button>

        <Sidebar collapsible="none" className="w-52 rounded-l-xl">
          <SidebarHeader>
            <div className="flex h-11 items-center px-2">
              <ShellNavbarTitle>Folders</ShellNavbarTitle>
            </div>
          </SidebarHeader>
          <SidebarContent className="scrollbar-mac p-2">
            <SidebarMenu>
              {FOLDERS.map((folder, index) => (
                <SidebarMenuItem key={folder}>
                  <SidebarMenuButton isActive={index === 1}>
                    <Folder />
                    <span>{folder}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <ShellInset>
          <ShellNavbar size="large" className="px-4">
            <ShellNavbarHeading>
              <ShellNavbarTitle className="text-[15px] leading-5">Notes</ShellNavbarTitle>
              <ShellNavbarSubtitle className="leading-[14px]">4 notes</ShellNavbarSubtitle>
            </ShellNavbarHeading>
            <ShellNavbarActions>
              <div className="flex h-7 w-40 items-center gap-2 rounded-[7px] bg-[var(--acr-field)] px-2 text-[12px] text-muted-foreground">
                <Search className="size-3.5" />
                <span>Search</span>
              </div>
              <Button variant="ghost" size="small" icon aria-label="New note">
                <PenLine />
              </Button>
            </ShellNavbarActions>
          </ShellNavbar>

          <ShellBody>
            <ShellPanel variant="list" className="w-56">
              <ShellContent padding="flush" className="scrollbar-mac">
                {NOTES.map((note, index) => {
                  const nextNote = NOTES[index + 1]
                  const showSeparator =
                    nextNote &&
                    note.title !== selectedTitle &&
                    nextNote.title !== selectedTitle

                  return (
                    <React.Fragment key={note.title}>
                      <Item
                        asChild
                        size="xs"
                        selected={note.title === selectedTitle}
                        className={[
                          "w-full rounded-none px-3 py-2",
                          "items-start gap-0 text-left",
                          "focus-visible:relative focus-visible:z-10",
                          "data-[selected=true]:bg-primary",
                          "data-[selected=true]:text-primary-foreground",
                          "[&[data-selected=true]_[data-slot=item-title]]:text-primary-foreground",
                          "[&[data-selected=true]_[data-slot=item-description]]:text-primary-foreground/80",
                        ].join(" ")}
                      >
                        <button
                          type="button"
                          className="w-full"
                          onClick={() => setSelectedTitle(note.title)}
                        >
                          <ItemContent className="flex min-w-0 flex-col">
                            <ItemTitle className="min-w-0 text-[13px] font-semibold leading-4">
                              {note.title}
                            </ItemTitle>
                            <ItemDescription className="mt-1 text-[11px] leading-[13px]">
                              {note.preview}
                            </ItemDescription>
                          </ItemContent>
                        </button>
                      </Item>
                      {showSeparator ? <ItemSeparator /> : null}
                    </React.Fragment>
                  )
                })}
              </ShellContent>
            </ShellPanel>

            <ShellPanel variant="detail">
              <ShellContent padding="reading" className="scrollbar-mac">
                <article className="mx-auto max-w-2xl space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-[24px] font-semibold leading-tight">
                      {selectedNote.title}
                    </h3>
                    <p className="text-[12px] text-muted-foreground">
                      Edited today
                    </p>
                  </div>
                  {selectedNote.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-[13px] leading-6 text-foreground/85"
                    >
                      {paragraph}
                    </p>
                  ))}
                </article>
              </ShellContent>
            </ShellPanel>
          </ShellBody>
        </ShellInset>
        </Shell>
      </div>
    </ExampleBackdrop>
  )
}
