"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
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

import { ThemeSwitcher } from "@/components/theme-switcher"

import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/registry/acrylic/avatar"
import { Badge } from "@/registry/acrylic/badge"
import { Button } from "@/registry/acrylic/button"
import { Card } from "@/registry/acrylic/card"
import { Combobox } from "@/registry/acrylic/combobox"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/acrylic/popover"
import { RadioGroup, RadioGroupItem } from "@/registry/acrylic/radio-group"
import { Separator } from "@/registry/acrylic/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/acrylic/sheet"
import { Slider } from "@/registry/acrylic/slider"
import { Switch } from "@/registry/acrylic/switch"
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
  { title: "Home", icon: Home },
  { title: "Inbox", icon: Inbox },
  { title: "Calendar", icon: Calendar },
  { title: "Search", icon: Search },
  { title: "Components", icon: Blocks },
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
      {/* Mirrors the card-nested example's "add" affordance: a plain text button,
          foreground label dimming to muted on hover — no fill to spill past the
          card padding, no negative margin. */}
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

/** One labelled tile in the Components gallery. */
function GalleryCard({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </Card>
  )
}

const FRAMEWORKS = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "vite", label: "Vite" },
]

/** The "Components" pane — a compact, live gallery of the library's main
 *  components, so the demo doubles as a showcase. Built to grow: drop more
 *  GalleryCards in. The whole sidebar shell (this included) is the unit the
 *  Tauri app reuses, so the switchable panes live here, not in the app. */
function ComponentsGallery() {
  const [framework, setFramework] = React.useState("")

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-mac">
      <div className="grid gap-4 sm:grid-cols-2">
        <GalleryCard label="Buttons">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="medium">Primary</Button>
            <Button size="medium" variant="secondary">
              Secondary
            </Button>
            <Button size="medium" variant="neutral">
              Neutral
            </Button>
            <Button size="medium" variant="ghost">
              Ghost
            </Button>
          </div>
        </GalleryCard>

        <GalleryCard label="Badges">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </GalleryCard>

        <GalleryCard label="Input">
          <Input placeholder="you@acrylic.dev" />
        </GalleryCard>

        <GalleryCard label="Toggles">
          <div className="flex items-center gap-5">
            <Switch defaultChecked />
            <Switch />
            <Slider defaultValue={[60]} className="flex-1" />
          </div>
        </GalleryCard>

        <GalleryCard label="Choice">
          <RadioGroup defaultValue="comfortable" className="flex gap-4">
            {["Default", "Comfortable", "Compact"].map((opt) => {
              const value = opt.toLowerCase()
              return (
                <label
                  key={value}
                  className="flex items-center gap-2 text-[13px]"
                >
                  <RadioGroupItem value={value} />
                  {opt}
                </label>
              )
            })}
          </RadioGroup>
        </GalleryCard>

        <GalleryCard label="Avatars">
          <div className="flex -space-x-2">
            {["jagger", "emily", "drew", "olivia"].map((u) => (
              <Avatar
                key={u}
                className="size-8 ring-2 ring-[var(--background)]"
              >
                <AvatarImage src={`https://avatar.vercel.sh/${u}`} alt={u} />
                <AvatarFallback>{u.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </GalleryCard>

        <GalleryCard label="Overlays">
          <div className="flex flex-wrap items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="medium" variant="neutral">
                  Dialog
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Frosted dialog</DialogTitle>
                  <DialogDescription>
                    A bounded overlay — safe to blur over the Backdrop.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost" size="medium">
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button size="medium">Confirm</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger asChild>
                <Button size="medium" variant="neutral">
                  Sheet
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Side sheet</SheetTitle>
                  <SheetDescription>
                    Slides in from the edge, frosted over the desktop.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Popover>
              <PopoverTrigger asChild>
                <Button size="medium" variant="neutral">
                  Popover
                </Button>
              </PopoverTrigger>
              <PopoverContent className="text-[13px]">
                A small floating panel anchored to its trigger.
              </PopoverContent>
            </Popover>
          </div>
        </GalleryCard>

        <GalleryCard label="Combobox">
          <Combobox
            options={FRAMEWORKS}
            value={framework}
            onValueChange={setFramework}
            placeholder="Pick a framework…"
          />
        </GalleryCard>
      </div>
    </div>
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

/** Home showcase block: a full application layout (sidebar + inset main pane)
 *  built entirely from the Acrylic components, floated on a colorful wallpaper
 *  so the frosted glass reads as real material. The frame is a rounded card (no
 *  -m-10 breakout — that's the docs preview's trick), sized to sit inside the
 *  home page rather than fill the viewport. The shell itself is copied from the
 *  `sidebar-app` example. */
export function SidebarBlock() {
  // The demo is stateful so nav selection swaps the main pane live — same as the
  // Tauri app. "Components" shows the gallery; everything else shows the board.
  const [active, setActive] = React.useState("Home")
  // Switching to the gallery mounts cmdk + the overlay primitives — a ~60ms first
  // render that would jank the click frame. Drive the heavy pane off a deferred
  // value so the nav highlight responds instantly while the pane render runs as a
  // non-blocking transition.
  const pane = React.useDeferredValue(active)

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
          <div className="flex h-[36rem] w-full overflow-hidden rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.28)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)]">
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
                            <SidebarMenuButton
                              isActive={active === item.title}
                              // Select on press (macOS source-list behaviour): the
                              // row's press-feedback bg is the same --acr-chip as the
                              // selected bg, so if selection waited for onClick
                              // (pointer-up) the just-pressed row and the still-
                              // selected row would both show the highlight for the
                              // press duration. onClick stays for keyboard (Enter/
                              // Space fire click, not pointerdown).
                              onPointerDown={() => setActive(item.title)}
                              onClick={() => setActive(item.title)}
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
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton>
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
                  {/* The demo dogfoods its own theme control: flip Light/Dark/Acrylic
                      here and watch the glass shell react live. */}
                  <ThemeSwitcher />
                  {pane !== "Components" && (
                    <Button size="medium" className="ms-auto">
                      <Plus className="size-4" strokeWidth={2.5} />
                      New loan
                    </Button>
                  )}
                </header>
                {pane === "Components" ? <ComponentsGallery /> : <LoansBoard />}
              </SidebarInset>
            </SidebarProvider>
          </div>
        </div>
      </div>
    </section>
  )
}
