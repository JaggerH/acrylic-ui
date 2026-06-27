"use client"

import { useState } from "react"

import {
  Calendar,
  ChevronRight,
  ChevronsUpDown,
  GalleryVerticalEnd,
  Home,
  Inbox,
  Search,
  Settings2,
} from "lucide-react"

import { ExampleBackdrop } from "@/components/example-backdrop"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/acrylic/avatar"
import { Separator } from "@/registry/acrylic/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/registry/acrylic/sidebar"

const NAV = [
  {
    id: "home",
    title:
      "Home dashboard with an extremely long primary navigation label",
    icon: Home,
  },
  { id: "inbox", title: "Inbox", icon: Inbox },
  { id: "calendar", title: "Calendar", icon: Calendar },
  { id: "search", title: "Search", icon: Search },
]

const PROJECT_ITEMS = [
  {
    id: "tokens",
    title: "Tokens And Semantic Color Variables With A Long Label",
  },
  {
    id: "components",
    title: "Components And Interaction Patterns With A Long Label",
  },
]

export default function SidebarApp() {
  const [activeItem, setActiveItem] = useState("home")
  const activeLabel =
    NAV.find((item) => item.id === activeItem)?.title ??
    PROJECT_ITEMS.find((item) => item.id === activeItem)?.title ??
    "Tokens"

  return (
    <ExampleBackdrop>
      <div className="flex h-[30rem] w-full max-w-3xl overflow-hidden rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
        <SidebarProvider className="h-full w-full min-h-0">
          {/* collapsible="icon": the SidebarTrigger in the header collapses the rail
              to icons and back — works inside this contained box with no extra CSS
              (the Sidebar positions itself within the provider). */}
          <Sidebar collapsible="icon" className="rounded-l-xl">
            {/* Header — team / workspace switcher */}
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" className="h-12">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
                      <GalleryVerticalEnd className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left leading-tight">
                      <span className="overflow-hidden text-[13px] font-semibold">
                        Acrylic Design Systems Incorporated With A Very Long Name
                      </span>
                      <span className="overflow-hidden text-[11px] text-muted-foreground">
                        Enterprise workspace description that should fade out
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="scrollbar-mac">
              <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {NAV.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={activeItem === item.id}
                          onClick={() => setActiveItem(item.id)}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Projects</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeItem === "design-system"}
                        onClick={() => setActiveItem("design-system")}
                      >
                        <Settings2 />
                        <span>Design System Navigation Item With A Very Long Label</span>
                        <ChevronRight className="ml-auto" />
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {PROJECT_ITEMS.map((item) => (
                          <SidebarMenuSubItem key={item.id}>
                            <SidebarMenuSubButton
                              isActive={activeItem === item.id}
                              onClick={() => setActiveItem(item.id)}
                            >
                              <span>{item.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            {/* Footer — user item with avatar */}
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" className="h-12">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage
                        src="https://avatar.vercel.sh/jagger"
                        alt="Jagger"
                      />
                      <AvatarFallback className="rounded-lg">JH</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left leading-tight">
                      <span className="overflow-hidden text-[13px] font-semibold">
                        Jagger H With A Very Long Display Name
                      </span>
                      <span className="overflow-hidden text-[11px] text-muted-foreground">
                        jagger.with.a.very.long.email.address@acrylic.dev
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>

          {/* Inset — the main content pane */}
          <SidebarInset className="bg-background">
            <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--acr-border)] px-4">
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="mr-1 !h-4 data-[orientation=vertical]:!h-4"
              />
              <span className="text-[13px] text-muted-foreground">
                Design System
              </span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
              <span className="min-w-0 truncate text-[13px] font-medium text-foreground">
                {activeLabel}
              </span>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
              <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-[var(--acr-chip)]" />
                <div className="aspect-video rounded-xl bg-[var(--acr-chip)]" />
                <div className="aspect-video rounded-xl bg-[var(--acr-chip)]" />
              </div>
              <div className="min-h-40 flex-1 rounded-xl bg-[var(--acr-chip)]" />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ExampleBackdrop>
  )
}
