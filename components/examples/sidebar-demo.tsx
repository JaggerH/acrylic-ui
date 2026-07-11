"use client"

import {
  Archive,
  ChevronRight,
  ChevronsUpDown,
  Folder,
  Inbox,
  Search,
  Send,
  Settings,
  Star,
  Trash2,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/acrylic/avatar"

import { ExampleBackdrop } from "@/components/example-backdrop"
import { Input } from "@/registry/acrylic/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/registry/acrylic/sidebar"

export default function SidebarDemo() {
  return (
    <ExampleBackdrop>
      <SidebarProvider className="h-[26rem] w-auto min-h-0">
        <Sidebar
          collapsible="none"
          className="h-full overflow-hidden rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
        >
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2 py-1">
                <div className="flex size-7 items-center justify-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)]">
                  <Send className="size-4" />
                </div>
                <span className="text-[13px] font-semibold text-foreground">
                  Acrylic Mail
                </span>
              </div>
              <div className="relative px-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search" className="h-8 pl-8" />
              </div>
            </SidebarHeader>

            <SidebarContent className="scrollbar-mac">
              <SidebarGroup>
                <SidebarGroupLabel>Mailboxes</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>
                        <Inbox />
                        <span>Inbox</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge>24</SidebarMenuBadge>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Star />
                        <span>Starred</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Send />
                        <span>Sent</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Archive />
                        <span>Archive</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Trash2 />
                        <span>Trash</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator />

              <SidebarGroup>
                <SidebarGroupLabel>Folders</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Folder />
                        <span>Projects</span>
                        <ChevronRight className="ml-auto" />
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton isActive>
                            Acrylic UI
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>Roadmap</SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Folder />
                        <span>Receipts</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" className="h-12">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage src="https://avatar.vercel.sh/jagger" alt="Jagger" />
                      <AvatarFallback className="rounded-lg">JH</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left leading-tight">
                      <span className="truncate text-[13px] font-semibold">Jagger H</span>
                      <span className="truncate text-[11px] text-muted-foreground">jagger@acrylic.dev</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </ExampleBackdrop>
  )
}
