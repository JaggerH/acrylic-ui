"use client"

import { useDeferredValue, useState, type ReactNode } from "react"
import {
  Blocks,
  ChevronRight,
  ChevronsUpDown,
  Flag,
  GalleryVerticalEnd,
  Home,
  Inbox,
  Paperclip,
  Plus,
  Settings2,
  SquarePen,
  Star,
  Trash2,
  type LucideIcon,
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
  Shell,
  ShellBody,
  ShellContent,
  ShellInset,
  ShellNavbar,
  ShellPanel,
  ShellPanelHeader,
} from "@/registry/acrylic/shell"
import {
  Item,
  ItemAction,
  ItemContent,
  ItemDescription,
  ItemMeta,
  ItemRow,
  ItemSeparator,
  ItemTitle,
} from "@/registry/acrylic/item"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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

type View = "home" | "inbox" | "components"

const NAV: { title: string; icon: typeof Home; view?: View }[] = [
  { title: "Home", icon: Home, view: "home" },
  { title: "Inbox", icon: Inbox, view: "inbox" },
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

const MESSAGES = [
  {
    from: "Acrylic UI",
    subject: "Registry review notes",
    preview: "The Shell primitive keeps app structure separate from Sidebar.",
    time: "9:42 AM",
    marker: Flag,
    active: true,
    initials: "AU",
    image:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
    body: [
      "Shell owns the window structure. Sidebar remains the source-list primitive, while the main panel can split into list and detail panes at exact macOS frame sizes.",
      "This Mail example uses Item for each message preview, so density, truncation, and actions can be reused without turning Shell into a mail-specific API.",
    ],
  },
  {
    from: "Mira Chen",
    subject: "Window shell sketches",
    preview: "I added a Mail-style split view and a Notes editor variant.",
    time: "8:15 AM",
    marker: Paperclip,
    initials: "MC",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    body: [
      "The split view is now close enough to the Mail reference that the remaining work is mostly behavioral polish.",
      "The important part is keeping the message list as Item composition, not a mail-only component.",
    ],
  },
  {
    from: "Design Systems",
    subject: "Source list density",
    preview: "Keep sidebar rows compact at 13px with muted counts.",
    time: "Yesterday",
    compact: true,
    initials: "DS",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    body: [
      "Density should come from stable primitives: fixed row heights, truncation rules, and predictable action slots.",
      "The same item anatomy can carry mail previews, command history, or document lists without changing Shell.",
    ],
  },
  {
    from: "Tauri",
    subject: "Vibrancy pass",
    preview: "The backdrop is visible through the shell and sidebar surfaces.",
    time: "Mon",
    marker: Star,
    initials: "TA",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80",
    body: [
      "The web demo and native shell share the same composition, but the material source changes underneath.",
      "That keeps the component API honest: Shell describes structure, while the host supplies the window environment.",
    ],
  },
  {
    from: "Release",
    subject: "Docs capture",
    preview: "The preview should match the macOS mail frame before API polish.",
    time: "Jun 22",
    marker: Flag,
    initials: "RE",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    body: [
      "The docs capture should show the product surface first: sidebar, list, detail, toolbar, and live theme switching.",
      "Once the frame reads correctly, the API story becomes much easier to explain.",
    ],
  },
  {
    from: "Preview Bot",
    subject: "Screenshot run",
    preview: "Playwright has a repeatable path for the docs shell page.",
    time: "Jun 21",
    initials: "PB",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    body: [
      "The verification script checks that the shell, sidebar, navbar, and inbox panes render without horizontal page overflow.",
      "It also captures both the default board and Inbox view so visual regressions are easier to compare.",
    ],
  },
]

function AppleIcon({
  icon: Icon,
  size = 14,
  strokeWidth = 1.5,
}: {
  icon: LucideIcon
  size?: number
  strokeWidth?: number
}) {
  return (
    <Icon
      aria-hidden
      absoluteStrokeWidth
      size={size}
      strokeWidth={strokeWidth}
    />
  )
}

function MailListItem({
  message,
  selected,
  onSelect,
}: {
  message: (typeof MESSAGES)[number]
  selected: boolean
  onSelect: () => void
}) {
  return (
    <Item
      asChild
      size="xs"
      selected={selected}
      className={[
        "w-full px-5 py-2.5",
        "items-start gap-0 text-left",
        "focus-visible:relative focus-visible:z-10",
        "data-[selected=true]:bg-primary",
        "data-[selected=true]:text-primary-foreground",
        "[&[data-selected=true]_[data-slot=item-title]]:text-primary-foreground",
        "[&[data-selected=true]_[data-slot=item-description]]:text-primary-foreground/80",
        "[&[data-selected=true]_[data-slot=item-meta]]:text-primary-foreground/80",
        "[&[data-selected=true]_[data-slot=item-actions]]:text-primary-foreground/80",
      ].join(" ")}
    >
      <button type="button" className="w-full" onClick={onSelect}>
        <ItemContent className="flex min-w-0 flex-col">
          <ItemRow className="h-4 items-center">
            <ItemTitle className="min-w-0 flex-1 text-[13px] font-semibold leading-4">
              {message.from}
            </ItemTitle>
            <ItemMeta className="text-[11px] leading-4">
              {message.time}
            </ItemMeta>
          </ItemRow>
          <ItemRow className="mt-1 h-[13px] items-center">
            <ItemTitle className="min-w-0 flex-1 text-[11px] font-medium leading-[13px]">
              {message.subject}
            </ItemTitle>
            <ItemAction className="h-3 w-3 text-muted-foreground [&>svg]:size-3">
              {message.marker ? (
                <AppleIcon icon={message.marker} size={12} strokeWidth={1.4} />
              ) : null}
            </ItemAction>
          </ItemRow>
          <ItemDescription
            className={[
              "mt-1 text-[11px] leading-[13px]",
              message.compact ? "line-clamp-1" : "line-clamp-2",
            ].join(" ")}
          >
            {message.preview}
          </ItemDescription>
        </ItemContent>
      </button>
    </Item>
  )
}

/** Inner card — one loan, rendered as a real nested <Card>. The parent column
 *  opts into nested surfaces so these cards read as recessed rows. */
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
    <Card nestedSurface className="flex w-72 shrink-0 flex-col gap-2.5 p-3 text-foreground">
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

function InboxMainPanel() {
  const [selectedSubject, setSelectedSubject] = useState(MESSAGES[0].subject)
  const selectedMessage =
    MESSAGES.find((message) => message.subject === selectedSubject) ?? MESSAGES[0]

  return (
    <>
      <ShellPanel variant="list" className="w-[225px] flex-none">
        <ShellPanelHeader className="h-[49px] px-4">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold leading-5">
              Inbox
            </div>
            <div className="truncate text-[11px] leading-[14px] text-muted-foreground">
              67 messages
            </div>
          </div>
          <Button
            variant="ghost"
            size="large"
            aria-label="New message"
            className="h-7 w-9 rounded-[6px] px-0"
          >
            <SquarePen />
          </Button>
        </ShellPanelHeader>
        <ShellContent
          padding="flush"
          className="scrollbar-mac overflow-x-hidden pt-1"
        >
          <div className="ml-2 w-[208px]">
            {MESSAGES.map((message, index) => {
              const nextMessage = MESSAGES[index + 1]
              const showSeparator =
                nextMessage &&
                message.subject !== selectedSubject &&
                nextMessage.subject !== selectedSubject

              return (
                <div key={message.subject}>
                  <MailListItem
                    message={message}
                    selected={message.subject === selectedSubject}
                    onSelect={() => setSelectedSubject(message.subject)}
                  />
                  {nextMessage ? (
                    <ItemSeparator
                      className={cn("mx-3", !showSeparator && "invisible")}
                    />
                  ) : null}
                </div>
              )
            })}
          </div>
        </ShellContent>
      </ShellPanel>

      <ShellPanel variant="detail" className="min-w-[425px] flex-1">
        <ShellNavbar className="h-[49px] justify-start px-3">
          <ThemeSwitcher />
        </ShellNavbar>

        <ShellContent padding="flush" className="scrollbar-mac px-5 pt-4">
          <article className="w-full">
            <header className="h-[67px] border-b border-[var(--acr-border-soft)]">
              <div className="flex h-[50px] gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--acr-chip)] text-[11px] font-semibold text-foreground">
                  {selectedMessage.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5">
                    <div className="truncate text-[13px] font-semibold leading-4">
                      {selectedMessage.from}
                    </div>
                    <div className="pt-px text-[11px] leading-[13px] text-muted-foreground whitespace-nowrap shrink-0">
                      {selectedMessage.time}
                    </div>
                  </div>
                  <div className="mt-1 grid grid-cols-[minmax(0,1fr)_12px] items-start gap-2">
                    <div className="truncate text-[11px] font-medium leading-[13px]">
                      {selectedMessage.subject}
                    </div>
                    <span className="mt-px text-muted-foreground">
                      {selectedMessage.marker ? (
                        <AppleIcon
                          icon={selectedMessage.marker}
                          size={12}
                          strokeWidth={1.4}
                        />
                      ) : null}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-[11px] leading-[13px] text-muted-foreground">
                    {selectedMessage.preview}
                  </div>
                </div>
              </div>
            </header>

            <div className="flex flex-col gap-4 pt-4">
              <div className="text-[13px] leading-6 text-foreground/85">
                {selectedMessage.body.map((paragraph) => (
                  <p key={paragraph} className="mt-3 first:mt-0">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="aspect-[16/10] w-full overflow-hidden rounded-[8px] border border-[var(--acr-border-soft)] bg-[var(--acr-card-nested)] shadow-[inset_0_1px_rgba(255,255,255,0.14)]">
                <img
                  src={selectedMessage.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </article>
        </ShellContent>
      </ShellPanel>
    </>
  )
}

export function SidebarDemo({
  framed = false,
  showThemeSwitcher = true,
  frameClassName,
  headerControls,
  windowControls,
  sidebarControls,
}: {
  framed?: boolean
  frameClassName?: string
  /** Web showcase shows the 3-way theme switcher; the Tauri app is always Acrylic
   *  (native vibrancy), so it hides the switcher and shows the pane title instead. */
  showThemeSwitcher?: boolean
  /** Host-provided controls for the inset header's right edge. */
  headerControls?: ReactNode
  /** Tauri-only: window control buttons (min/max/close). When provided, the inset
   *  header becomes the window drag region and hosts these at its right edge
   *  (replacing the New Loan button). Omitted on the web — keep it host-agnostic. */
  windowControls?: ReactNode
  /** Tauri/macOS-only: traffic lights rendered at the SIDEBAR's top-left (the native
   *  mac placement — no separate titlebar). The row they sit in is the drag region. */
  sidebarControls?: ReactNode
}) {
  // Nav selection swaps the inset pane live. Only Home/Components map to a view;
  // the others are decorative. Switching to Components mounts the whole gallery
  // (overlays, toasts, tooltips) — a heavy first render — so drive the pane off a
  // deferred value: the nav highlight stays instant and the gallery render runs as
  // a non-blocking transition.
  const [view, setView] = useState<View>("home")
  const pane = useDeferredValue(view)

  const shell = (
    <Shell
      sidebarWidth={240}
      sidebarCollapsedWidth={48}
      className={cn(
        framed ? "min-h-0 w-full" : "h-full w-full",
        "bg-transparent"
      )}
    >
      <Sidebar collapsible="icon" className={framed ? "rounded-l-xl" : undefined}>
        {/* macOS traffic lights sit at the sidebar's top-left (native placement); the
            row is the window drag region. Tauri/mac only — omitted everywhere else. */}
        {sidebarControls && (
          <div
            {...{ "data-tauri-drag-region": "" }}
            className="flex h-7 shrink-0 items-center px-3"
          >
            {sidebarControls}
          </div>
        )}
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
      <ShellInset
        data-nested-surface="true"
        className={cn(
          "acr-frosted relative min-w-0 bg-[var(--background)] text-foreground backdrop-blur-2xl backdrop-brightness-150",
          framed && "rounded-r-xl"
        )}
      >
        <Toaster />
        {pane === "inbox" && (windowControls || headerControls) ? (
          <div
            {...(windowControls ? { "data-tauri-drag-region": "" } : {})}
            className={cn(
              "absolute right-3 z-20 flex",
              // Tauri window buttons fill the navbar top-to-bottom (49px, flush to the
              // top edge) like standard caption buttons; the web fullscreen toggle stays
              // a centered float.
              windowControls ? "top-0 h-[49px] items-stretch" : "top-2 items-center"
            )}
          >
            {windowControls ? (
              <div className="flex items-stretch self-stretch">{windowControls}</div>
            ) : (
              headerControls
            )}
          </div>
        ) : null}
        {pane !== "inbox" ? (
          <ShellNavbar
            // Tauri only: the header IS the titlebar, so make it the drag region.
            // data-tauri-drag-region matches only the EXACT mousedown target: a bare
            // navbar drags, but any child on top of it blocks the drag. So the passive
            // chrome (separator, title) each carries the attribute too — making it a
            // first-class drag target like the bare padding, so the WHOLE bar drags
            // uniformly. (pointer-events-none fall-through also "works" but makes
            // webkit2gtk paint a no-drop cursor mid-drag.) Only the real controls
            // (trigger, window buttons) stay interactive. `select-none` stops the title
            // text from being selected on click.
            {...(windowControls ? { "data-tauri-drag-region": "" } : {})}
            size="large"
            className="h-12 select-none border-[var(--acr-border)] px-4"
          >
            <SidebarTrigger />
            <Separator
              data-tauri-drag-region=""
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
              <span
                data-tauri-drag-region=""
                className="text-[15px] font-semibold text-foreground"
              >
                {pane === "components" ? "Components" : "Loans"}
              </span>
            )}
            {/* Host controls take over the header's right edge. Tauri uses native window
                buttons; the web landing page uses a fullscreen toggle. Without either,
                the web demo keeps its New Loan action there. */}
            {windowControls ? (
              <div className="ml-auto flex items-stretch self-stretch">
                {windowControls}
              </div>
            ) : headerControls ? (
              <div className="ml-auto flex items-center">{headerControls}</div>
            ) : (
              pane === "home" && <NewLoanDialog />
            )}
          </ShellNavbar>
        ) : null}
        <ShellBody>
          {pane === "inbox" ? (
            <InboxMainPanel />
          ) : pane === "components" ? (
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-mac">
              <ComponentsGallery />
            </div>
          ) : (
            <LoansBoard />
          )}
        </ShellBody>
      </ShellInset>
    </Shell>
  )

  if (!framed) return shell

  return (
    // Separation via box-shadow, not a border. The drop shadow reads on
    // light/acrylic; in dark it vanishes, so add a 1px light ring there.
    <div
      className={cn(
        "flex h-[36rem] w-full overflow-hidden rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.28)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)]",
        frameClassName
      )}
    >
      {shell}
    </div>
  )
}
