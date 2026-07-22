"use client"

import * as React from "react"
import { Folder, Maximize2, Minimize2, PenLine, Search } from "lucide-react"

import { ExampleBackdrop } from "@/components/example-backdrop"
import { Button } from "@/registry/acrylic/button"
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
  "Shell component boundary",
  "macOS Mail split view",
  "Notes editor padding",
  "Registry docs outline",
]

export default function ShellNotes() {
  const [expanded, setExpanded] = React.useState(false)
  const ExpandIcon = expanded ? Minimize2 : Maximize2

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
            <ShellPanel variant="list" className="w-72">
              <ShellContent padding="flush" className="scrollbar-mac">
                {NOTES.map((note, index) => (
                  <button
                    className={[
                      "block w-full border-b border-[var(--acr-border-soft)] px-3 py-3.5 text-left",
                      index === 0
                        ? "bg-primary/10"
                        : "hover:bg-[var(--acr-hover)]",
                    ].join(" ")}
                    key={note}
                    type="button"
                  >
                    <div className="truncate text-[13px] font-semibold">
                      {note}
                    </div>
                    <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                      Shell is a composable layout primitive. App names belong in
                      examples, not exports.
                    </div>
                  </button>
                ))}
              </ShellContent>
            </ShellPanel>

            <ShellPanel variant="detail">
              <ShellContent padding="reading" className="scrollbar-mac">
                <article className="mx-auto max-w-2xl space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-[24px] font-semibold leading-tight">
                      Shell component boundary
                    </h3>
                    <p className="text-[12px] text-muted-foreground">
                      Edited today
                    </p>
                  </div>
                  <p className="text-[13px] leading-6 text-foreground/85">
                    A shell describes the app frame: sidebar, inset, panels,
                    navbar, and scrollable content. Users compose those pieces
                    into Mail, Notes, or their own product surface.
                  </p>
                  <h4 className="pt-2 text-[15px] font-semibold">
                    Shell component boundary
                  </h4>
                  <p className="text-[13px] leading-6 text-foreground/85">
                    Panel headers are for local list metadata. Reading and
                    editing surfaces should let the document title live inside
                    the content.
                  </p>
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
