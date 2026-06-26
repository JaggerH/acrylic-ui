"use client"

import { useDeferredValue, useState } from "react"
import {
  Blocks,
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
import { ComponentsGallery } from "@/components/components-gallery"
import { ThemeSwitcher } from "@/components/theme-switcher"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/acrylic/avatar"
import { Badge } from "@/registry/acrylic/badge"
import { Button } from "@/registry/acrylic/button"
import { Card } from "@/registry/acrylic/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/acrylic/dialog"
import { Input } from "@/registry/acrylic/input"
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
import { Toaster } from "@/registry/acrylic/sonner"

// The single, shared "whole application in glass" demo — a full app shell
// (sidebar + inset, with a switchable Loans board / Components gallery) built
// entirely from the Acrylic components. The web landing page and the Tauri
// playground BOTH render this verbatim; the only thing that differs between the
// two hosts is the Backdrop (web paints a wallpaper, Tauri goes transparent for
// native vibrancy). `framed` adds the bounded-card chrome the landing page wants;
// the Tauri window renders it edge-to-edge.

type View = "home" | "components"

const NAV: { title: string; icon: typeof Home; view?: View }[] = [
  { title: "Home", icon: Home, view: "home" },
  { title: "Inbox", icon: Inbox },
  { title: "Calendar", icon: Calendar },
  { title: "Search", icon: Search },
  { title: "Components", icon: Blocks, view: "components" },
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
      { initials: "DM", name: "David Martinez", time: "Just now", addr: "321 Birch Lane, Miami, FL 33101", amount: "$1,200,000", kind: "Purchase - DSCR", color: "bg-blue-500/90" },
      { initials: "EC", name: "Emily Carter", time: "1 week ago", addr: "789 Pine Road, Denver, CO 80203", amount: "$420,000", kind: "Purchase - Conventional", color: "bg-zinc-400/90" },
      { initials: "ON", name: "Olivia Nguyen", time: "2 weeks ago", addr: "654 Cedar Street, Seattle, WA 98101", amount: "$275,000", kind: "Purchase - Conventional", color: "bg-violet-500/90" },
    ],
  },
  {
    name: "Qualification",
    loans: [
      { initials: "DC", name: "Drew Chen", time: "10 mins ago", addr: "12 Evergreen Street, Austin, TX 7520", amount: "$600,000", kind: "Purchase - DSCR", color: "bg-zinc-400/90" },
      { initials: "JW", name: "James Wilson", time: "3 days ago", addr: "88 Maple Avenue, Portland, OR 97205", amount: "$530,000", kind: "Refinance - Conventional", color: "bg-amber-500/90" },
    ],
  },
]

/** Inner card — one loan, a real nested <Card>. Inside the frosted inset the
 *  `.acr-frosted [data-slot=card]` rule auto-drops its blur and tints it darker. */
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
        <span className="ms-auto text-[10px] text-muted-foreground">{loan.time}</span>
      </div>
      <p className="mt-1.5 text-[12px]">{loan.addr}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{loan.amount} · {loan.kind}</p>
    </Card>
  )
}

/** Outer card — one pipeline column holding its loan cards + an add row. */
function LoanColumn({ name, loans }: { name: string; loans: Loan[] }) {
  return (
    <Card className="flex w-72 shrink-0 flex-col gap-2.5 p-3 text-foreground">
      <div className="flex items-center gap-2 px-0.5">
        <span className="text-[13px] font-semibold">{name}</span>
        <Badge variant="secondary" className="min-w-5 px-1.5 text-[11px] tabular-nums">
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
      {/* Plain text button (matches the card-nested example): foreground -> muted
          on hover, no fill to spill past the card padding. */}
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-[13px] font-medium text-foreground transition-colors hover:text-muted-foreground"
      >
        <Plus className="size-4" strokeWidth={2.5} />
        Add new loan
      </button>
    </Card>
  )
}

/** New-loan Dialog — exercises the frosted overlay inside the app shell. */
function NewLoanDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="medium" className="ms-auto">
          <Plus className="size-4" strokeWidth={2.5} />
          New loan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>New loan</DialogTitle>
          <DialogDescription>The overlay frosts the app behind it.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-1">
          <Input placeholder="Borrower name" />
          <Input placeholder="Property address" />
          <Input placeholder="Amount" defaultValue="$500,000" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="neutral">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Create</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** The Loans board — the demo's default "app view". */
function LoansBoard() {
  return (
    <div className="flex min-h-0 flex-1 items-start gap-4 overflow-auto p-4 scrollbar-mac">
      {COLUMNS.map((col) => (
        <LoanColumn key={col.name} name={col.name} loans={col.loans} />
      ))}
    </div>
  )
}

export function SidebarDemo({
  framed = false,
  showThemeSwitcher = true,
}: {
  framed?: boolean
  /** Web showcase shows the 3-way theme switcher; the Tauri app is always Acrylic
   *  (native vibrancy), so it hides the switcher and shows the pane title instead. */
  showThemeSwitcher?: boolean
}) {
  // Nav selection swaps the inset pane live. Only Home/Components map to a view;
  // the others are decorative. Switching to Components mounts the whole gallery
  // (overlays, toasts, tooltips) — a heavy first render — so drive the pane off a
  // deferred value: the nav highlight stays instant and the gallery render runs as
  // a non-blocking transition.
  const [view, setView] = useState<View>("home")
  const pane = useDeferredValue(view)

  const shell = (
    <SidebarProvider className={framed ? "min-h-0 w-full" : "h-screen w-screen"}>
      <Sidebar collapsible="icon" className={framed ? "rounded-l-xl" : undefined}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="h-12">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-[13px] font-semibold">Acrylic Inc</span>
                  <span className="truncate text-[11px] text-muted-foreground">Enterprise</span>
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
                    <SidebarMenuButton
                      isActive={item.view ? item.view === view : false}
                      // Select on press (macOS source-list): selected bg and press
                      // bg are both --acr-chip, so selecting on click (pointer-up)
                      // leaves the just-pressed row and the still-selected row both
                      // highlighted for the press duration. onClick kept for keyboard.
                      onPointerDown={() => item.view && setView(item.view)}
                      onClick={() => item.view && setView(item.view)}
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
                  <SidebarMenuButton>
                    <Settings2 />
                    <span>Design System</span>
                    <ChevronRight className="ml-auto" />
                  </SidebarMenuButton>
                  {/* Collapsed-rail flyout is automatic — SidebarMenuItem surfaces
                      this sub-menu in a HoverCard when the sidebar is icon-only. */}
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Tokens</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Components</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
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

      {/* `backdrop-brightness-150` lifts the frosted main panel — over the dark
          Backdrop the `--background` veil alone reads too dim; brightening the
          backdrop the blur samples makes the glass read lighter/airier. */}
      <SidebarInset
        className={cn(
          "acr-frosted min-w-0 backdrop-brightness-150",
          framed && "rounded-r-xl"
        )}
      >
        <Toaster />
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--acr-border)] px-4">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mr-1 !h-4 data-[orientation=vertical]:!h-4"
          />
          {/* Web showcase dogfoods its own theme control (flip Light/Dark/Acrylic
              and watch the glass react). The Tauri app is always Acrylic over native
              vibrancy, so switching there would just cover the OS material — it shows
              the pane title instead. */}
          {showThemeSwitcher ? (
            <ThemeSwitcher />
          ) : (
            <span className="text-[15px] font-semibold text-foreground">
              {pane === "components" ? "Components" : "Loans"}
            </span>
          )}
          {pane === "home" && <NewLoanDialog />}
        </header>
        {pane === "components" ? (
          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-mac">
            <ComponentsGallery />
          </div>
        ) : (
          <LoansBoard />
        )}
      </SidebarInset>
    </SidebarProvider>
  )

  if (!framed) return shell

  return (
    // Separation via box-shadow, not a border. The drop shadow reads on
    // light/acrylic; in dark it vanishes, so add a 1px light ring there.
    <div className="flex h-[36rem] w-full overflow-hidden rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.28)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)]">
      {shell}
    </div>
  )
}
