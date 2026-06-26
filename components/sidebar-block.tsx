"use client"

import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  ChevronsUpDown,
  GalleryVerticalEnd,
  Home,
  Inbox,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/acrylic/avatar"
import { Badge } from "@/registry/acrylic/badge"
import { Button } from "@/registry/acrylic/button"
import { Card } from "@/registry/acrylic/card"
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
  { title: "Home", icon: Home, isActive: true },
  { title: "Inbox", icon: Inbox },
  { title: "Calendar", icon: Calendar },
  { title: "Search", icon: Search },
]

type Loan = {
  initials: string
  name: string
  time: string
  addr: string
  amount: string
  kind: string
  color: string
}

const COLUMNS: { name: string; loans: Loan[] }[] = [
  {
    name: "App intake",
    loans: [
      {
        initials: "DM",
        name: "David Martinez",
        time: "Just now",
        addr: "321 Birch Lane, Miami, FL 33101",
        amount: "$1,200,000",
        kind: "Purchase - DSCR",
        color: "bg-blue-500/90",
      },
      {
        initials: "EC",
        name: "Emily Carter",
        time: "1 week ago",
        addr: "789 Pine Road, Denver, CO 80203",
        amount: "$420,000",
        kind: "Purchase - Conventional",
        color: "bg-zinc-400/90",
      },
      {
        initials: "ON",
        name: "Olivia Nguyen",
        time: "2 weeks ago",
        addr: "654 Cedar Street, Seattle, WA 98101",
        amount: "$275,000",
        kind: "Purchase - Conventional",
        color: "bg-violet-500/90",
      },
    ],
  },
  {
    name: "Qualification",
    loans: [
      {
        initials: "DC",
        name: "Drew Chen",
        time: "10 mins ago",
        addr: "12 Evergreen Street, Austin, TX 7520",
        amount: "$600,000",
        kind: "Purchase - DSCR",
        color: "bg-zinc-400/90",
      },
      {
        initials: "JW",
        name: "James Wilson",
        time: "3 days ago",
        addr: "88 Maple Avenue, Portland, OR 97205",
        amount: "$530,000",
        kind: "Refinance - Conventional",
        color: "bg-amber-500/90",
      },
    ],
  },
]

/** Inner card — one loan, rendered as a real nested <Card>. Inside the column
 *  Card (itself inside the frosted inset), the `.acr-frosted [data-slot=card]`
 *  rule auto-drops its blur and tints it one step darker — no hand-rolled fill. */
function LoanCard({ loan }: { loan: Loan }) {
  return (
    <Card className="p-2.5">
      <div className="flex items-center gap-2">
        <Avatar className="size-5">
          <AvatarFallback className={cn("text-[8px] text-white", loan.color)}>
            {loan.initials}
          </AvatarFallback>
        </Avatar>
        <span className="text-[12px] font-semibold">{loan.name}</span>
        <span className="ms-auto text-[10px] text-muted-foreground">
          {loan.time}
        </span>
      </div>
      <p className="mt-1.5 text-[12px]">{loan.addr}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {loan.amount} · {loan.kind}
      </p>
    </Card>
  )
}

/** Outer card — one pipeline column holding its loan cards + an add row. */
function LoanColumn({ name, loans }: { name: string; loans: Loan[] }) {
  return (
    <Card className="flex w-72 shrink-0 flex-col gap-2.5 p-3 text-foreground">
      <div className="flex items-center gap-2 px-0.5">
        <span className="text-[13px] font-semibold">{name}</span>
        <Badge
          variant="secondary"
          className="min-w-5 px-1.5 text-[11px] tabular-nums"
        >
          {loans.length}
        </Badge>
        <Button
          icon
          size="medium"
          variant="ghost"
          aria-label="Delete column"
          className="ms-auto text-muted-foreground hover:text-foreground"
        >
          <Trash2 />
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {loans.map((loan) => (
          <LoanCard key={loan.name} loan={loan} />
        ))}
      </div>
      <Button variant="ghost" size="medium" className="-ms-3 justify-start">
        <Plus strokeWidth={2.5} />
        Add new loan
      </Button>
    </Card>
  )
}

/** Home showcase block: a full application layout (sidebar + inset main pane)
 *  built entirely from the Acrylic components, floated on a colorful wallpaper
 *  so the frosted glass reads as real material. The frame is a rounded card (no
 *  -m-10 breakout — that's the docs preview's trick), sized to sit inside the
 *  home page rather than fill the viewport. The shell itself is copied from the
 *  `sidebar-app` example. */
export function SidebarBlock() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          A whole application, in glass
        </h2>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Sidebar, inset, avatars, nested nav — composed from the Acrylic
          components, floating on the desktop.
        </p>
        <div className="mt-5 flex justify-center">
          <Button asChild size="xl">
            <Link href="/docs">
              Browse the components
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* The shell frosts over the REAL global Backdrop (acrylic) — no faked
          wallpaper — so the demo tracks the live theme as the user switches. */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Application shell */}
        <div className="relative p-6 sm:p-12">
          {/* Separation via box-shadow, not a border (no layout edge, more refined).
              The drop shadow alone reads on light/acrylic; in dark it vanishes, so add
              a 1px light ring (0 0 0 1px) only there to outline the window. */}
          <div className="flex w-full overflow-hidden rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.28)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)]">
            <SidebarProvider className="min-h-0 w-full">
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
                          <span className="truncate text-[13px] font-semibold">
                            Acrylic Inc
                          </span>
                          <span className="truncate text-[11px] text-muted-foreground">
                            Enterprise
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
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton isActive={item.isActive}>
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
                          <SidebarMenuButton>
                            <Settings2 />
                            <span>Design System</span>
                            <ChevronRight className="ml-auto" />
                          </SidebarMenuButton>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton isActive>
                                Tokens
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton>
                                Components
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
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
                          <AvatarFallback className="rounded-lg">
                            JH
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left leading-tight">
                          <span className="truncate text-[13px] font-semibold">
                            Jagger H
                          </span>
                          <span className="truncate text-[11px] text-muted-foreground">
                            jagger@acrylic.dev
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarFooter>
              </Sidebar>

              {/* Inset — the Loans board. Its own frosted pane (surface + blur)
                  sitting directly on the wallpaper, so the board area is real
                  frosted glass rather than borrowing a shell layer's blur. */}
              <SidebarInset className="acr-frosted min-w-0 rounded-r-xl">
                <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--acr-border)] px-4">
                  <SidebarTrigger />
                  <Separator
                    orientation="vertical"
                    className="mr-1 !h-4 data-[orientation=vertical]:!h-4"
                  />
                  <span className="text-[15px] font-semibold text-foreground">
                    Loans
                  </span>
                  <Button size="medium" className="ms-auto">
                    <Plus className="size-4" strokeWidth={2.5} />
                    New loan
                  </Button>
                </header>
                <div className="flex items-start gap-4 overflow-x-auto p-4 scrollbar-mac">
                  {COLUMNS.map((col) => (
                    <LoanColumn key={col.name} name={col.name} loans={col.loans} />
                  ))}
                </div>
              </SidebarInset>
            </SidebarProvider>
          </div>
        </div>
      </div>
    </section>
  )
}
