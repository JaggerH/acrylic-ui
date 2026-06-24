"use client"

import { Inbox, Send, Star } from "lucide-react"

import { ExampleBackdrop } from "@/components/example-backdrop"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/registry/acrylic/sidebar"

const SIZES = [
  { size: "sm" as const, label: "Small · 24 / 11px" },
  { size: "default" as const, label: "Medium · 32 / 13px" },
  { size: "lg" as const, label: "Large · 40 / 15px" },
]

export default function SidebarSizes() {
  return (
    <ExampleBackdrop className="gap-4 !flex-row flex-wrap items-start justify-center">
      {SIZES.map(({ size, label }) => (
        <SidebarProvider key={size} className="w-auto min-h-0">
          <Sidebar
            collapsible="none"
            className="overflow-hidden rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
          >
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>{label}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton size={size} isActive>
                          <Inbox />
                          <span>Inbox</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton size={size}>
                          <Star />
                          <span>Starred</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton size={size}>
                          <Send />
                          <span>Sent</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      ))}
    </ExampleBackdrop>
  )
}
