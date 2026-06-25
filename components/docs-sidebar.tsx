"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, PanelLeftIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useTreeContext } from "fumadocs-ui/contexts/tree"
import { useDocsLayout } from "fumadocs-ui/layouts/docs"
import { useSidebar as useFumadocsSidebar } from "fumadocs-ui/layouts/docs/slots/sidebar"
import { SidebarCollapseTrigger } from "fumadocs-ui/components/sidebar/base"
import type * as PageTree from "fumadocs-core/page-tree"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/registry/acrylic/sidebar"
import { ThemeSwitcher } from "@/components/theme-switcher"

/** Docs nav rendered with the Acrylic Sidebar (dogfooding). Plugs into Fumadocs'
 *  `slots.sidebar.root`; the page tree comes from Fumadocs' TreeContext, active
 *  state from the current path, and the chrome (title / collapse / search / GitHub
 *  / theme switch) is pulled back in from the layout slots so nothing is lost by
 *  replacing the default sidebar. The aside sits in the layout grid's `sidebar`
 *  area (width via --fd-sidebar-width, set on the container). */
function PageItem({
  node,
  pathname,
}: {
  node: PageTree.Item
  pathname: string
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={pathname === node.url}>
        <Link href={node.url}>
          {node.icon}
          <span>{node.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function Pages({
  nodes,
  pathname,
}: {
  nodes: PageTree.Node[]
  pathname: string
}) {
  return (
    <SidebarMenu>
      {nodes.map((node, i) =>
        node.type === "page" ? (
          <PageItem key={i} node={node} pathname={pathname} />
        ) : null
      )}
    </SidebarMenu>
  )
}

function FolderGroup({
  node,
  pathname,
}: {
  node: PageTree.Folder
  pathname: string
}) {
  const containsActive = node.children.some(
    (c) => c.type === "page" && c.url === pathname
  )
  const [open, setOpen] = React.useState(
    node.defaultOpen ?? containsActive ?? true
  )

  return (
    <SidebarGroup>
      {node.name ? (
        <SidebarGroupLabel asChild>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex w-full items-center hover:text-foreground"
          >
            {node.name}
            <ChevronRight
              className={cn(
                "ml-auto size-3.5 transition-transform",
                open && "rotate-90"
              )}
            />
          </button>
        </SidebarGroupLabel>
      ) : null}
      {open ? (
        <SidebarGroupContent>
          <Pages nodes={node.children} pathname={pathname} />
        </SidebarGroupContent>
      ) : null}
    </SidebarGroup>
  )
}

export function DocsSidebar(props: React.ComponentProps<"aside">) {
  const { root } = useTreeContext()
  const pathname = usePathname()
  const { slots, menuItems } = useDocsLayout()

  const { collapsed } = useFumadocsSidebar()
  const NavTitle = slots.navTitle
  const SearchTrigger = slots.searchTrigger
  const iconLinks = menuItems.filter((item) => item.type === "icon")

  return (
    <>
    <aside
      {...props}
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 hidden h-dvh [grid-area:sidebar] overflow-hidden transition-[width] duration-200 md:block",
        collapsed ? "w-0" : "w-(--fd-sidebar-width)"
      )}
    >
      <SidebarProvider className="min-h-0 h-full w-full">
        <Sidebar
          collapsible="none"
          className="h-full !w-full border-r border-[var(--acr-border)]"
        >
          <SidebarHeader className="gap-2">
            <div className="flex items-center gap-2 px-1">
              {NavTitle ? (
                <NavTitle className="me-auto inline-flex items-center gap-2 text-[17px] font-semibold tracking-tight" />
              ) : null}
              <SidebarCollapseTrigger
                aria-label="Collapse sidebar"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[var(--acr-hover)] [&>svg]:size-4"
              >
                <PanelLeftIcon />
              </SidebarCollapseTrigger>
            </div>
            {SearchTrigger ? <SearchTrigger.full hideIfDisabled /> : null}
          </SidebarHeader>

          <SidebarContent className="scrollbar-mac">
            {(() => {
              // Group CONSECUTIVE top-level page links into one menu so they pack
              // tightly (gap-0), instead of each becoming its own SidebarGroup —
              // which adds py-1 + the SidebarContent gap-2 between them (~16px, too
              // airy once two top-level pages sit next to each other). Folders and
              // separators break the run.
              const out: React.ReactNode[] = []
              let run: PageTree.Node[] = []
              const flush = (key: string) => {
                if (!run.length) return
                const nodes = run
                run = []
                out.push(
                  <SidebarGroup key={key} className="py-1">
                    <SidebarGroupContent>
                      <Pages nodes={nodes} pathname={pathname} />
                    </SidebarGroupContent>
                  </SidebarGroup>
                )
              }
              root.children.forEach((node, i) => {
                if (node.type === "folder") {
                  flush(`run-${i}`)
                  out.push(<FolderGroup key={i} node={node} pathname={pathname} />)
                } else if (node.type === "separator") {
                  flush(`run-${i}`)
                  out.push(
                    <SidebarGroupLabel key={i} className="mt-1">
                      {node.name}
                    </SidebarGroupLabel>
                  )
                } else {
                  run.push(node)
                }
              })
              flush("run-tail")
              return out
            })()}
          </SidebarContent>

          <SidebarFooter>
            <div className="flex items-center gap-0.5 px-1">
              {iconLinks.map((item, i) => (
                <a
                  key={i}
                  href={"url" in item ? item.url : "#"}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={"text" in item ? String(item.text) : "Link"}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[var(--acr-hover)] [&>svg]:size-4.5"
                >
                  {"icon" in item ? item.icon : null}
                </a>
              ))}
              <ThemeSwitcher className="ms-auto" />
            </div>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </aside>
    {collapsed ? (
      <SidebarCollapseTrigger
        aria-label="Expand sidebar"
        className="fixed bottom-3 left-3 z-40 hidden items-center justify-center rounded-lg border border-[var(--acr-border)] bg-[var(--acr-panel)] p-2 text-muted-foreground shadow-[0_4px_16px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-colors hover:text-foreground md:flex [&>svg]:size-4"
      >
        <PanelLeftIcon />
      </SidebarCollapseTrigger>
    ) : null}
    </>
  )
}
