import { useState } from "react"
import {
  Calendar,
  ChevronRight,
  ChevronsUpDown,
  GalleryVerticalEnd,
  Home,
  Inbox,
  LayoutGrid,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/acrylic/avatar"
import { Badge } from "@/registry/acrylic/badge"
import { Button } from "@/registry/acrylic/button"
import { ButtonGroup, ButtonGroupItem } from "@/registry/acrylic/button-group"
import { Card } from "@/registry/acrylic/card"
import { Input } from "@/registry/acrylic/input"
import { Separator } from "@/registry/acrylic/separator"
import { Toaster } from "@/registry/acrylic/sonner"
import ComponentsGallery from "./ComponentsGallery"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/registry/acrylic/dialog"
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

type View = "home" | "components"

const NAV: { title: string; icon: typeof Home; view?: View }[] = [
  { title: "Home", icon: Home, view: "home" },
  { title: "Components", icon: LayoutGrid, view: "components" },
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

function LoanCard({ loan }: { loan: Loan }) {
  return (
    <Card className="p-2.5">
      <div className="flex items-center gap-2">
        <Avatar className="size-5">
          <AvatarFallback className={cn("text-[8px] text-white", loan.color)}>{loan.initials}</AvatarFallback>
        </Avatar>
        <span className="text-[12px] font-semibold">{loan.name}</span>
        <span className="ms-auto text-[10px] text-muted-foreground">{loan.time}</span>
      </div>
      <p className="mt-1.5 text-[12px]">{loan.addr}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{loan.amount} · {loan.kind}</p>
    </Card>
  )
}

function LoanColumn({ name, loans }: { name: string; loans: Loan[] }) {
  return (
    <Card className="flex w-72 shrink-0 flex-col gap-2.5 p-3 text-foreground">
      <div className="flex items-center gap-2 px-0.5">
        <span className="text-[13px] font-semibold">{name}</span>
        <Badge variant="secondary" className="min-w-5 px-1.5 text-[11px] tabular-nums">{loans.length}</Badge>
        <Button icon size="medium" variant="ghost" aria-label="Delete column" className="ms-auto text-muted-foreground hover:text-foreground">
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

// New-loan Dialog — also exercises the frosted overlay (useModalAcrylicBody) inside
// the real app shell, so we can verify modal frost over native acrylic.
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

export default function App() {
  const [dark, setDark] = useState(true)
  const [view, setView] = useState<View>("home")
  function setTheme(d: boolean) {
    setDark(d)
    document.documentElement.classList.toggle("dark", d)
  }

  return (
    <SidebarProvider className="h-screen w-screen">
      <Sidebar collapsible="icon">
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
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton isActive>Tokens</SidebarMenuSubButton>
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

      <SidebarInset className="acr-frosted min-w-0">
        <Toaster />
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--acr-border)] px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 !h-4 data-[orientation=vertical]:!h-4" />
          <span className="text-[15px] font-semibold text-foreground">
            {view === "components" ? "Components" : "Loans"}
          </span>
          <ButtonGroup
            variant="segmented"
            size="medium"
            value={dark ? "dark" : "light"}
            onValueChange={(v) => setTheme(v === "dark")}
            className="ms-auto"
          >
            <ButtonGroupItem value="light">Light</ButtonGroupItem>
            <ButtonGroupItem value="dark">Dark</ButtonGroupItem>
          </ButtonGroup>
          {view === "home" && <NewLoanDialog />}
        </header>
        {view === "components" ? (
          <div className="flex-1 overflow-y-auto scrollbar-mac">
            <ComponentsGallery />
          </div>
        ) : (
          <div className="flex items-start gap-4 overflow-x-auto p-4 scrollbar-mac">
            {COLUMNS.map((col) => (
              <LoanColumn key={col.name} name={col.name} loans={col.loans} />
            ))}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
