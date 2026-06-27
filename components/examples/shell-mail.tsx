"use client"

import * as React from "react"
import {
  Archive,
  ArchiveX,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Forward,
  Inbox,
  Maximize2,
  Minimize2,
  Paperclip,
  Reply,
  Send,
  SquarePen,
  Star,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import { ExampleBackdrop } from "@/components/example-backdrop"
import { Button } from "@/registry/acrylic/button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/registry/acrylic/button-group"
import {
  Item,
  ItemAction,
  ItemContent,
  ItemDescription,
  ItemMeta,
  ItemRow,
  ItemTitle,
} from "@/registry/acrylic/item"
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
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/registry/acrylic/sidebar"

const MAILBOXES = [
  { title: "Inbox", count: 18, icon: Inbox, active: true },
  { title: "VIP", count: 4, icon: Star },
  { title: "Sent", count: 0, icon: Send },
  { title: "Later", count: 7, icon: Clock },
  { title: "Archive", count: 0, icon: Archive },
  { title: "Trash", count: 0, icon: Trash2 },
]

const MESSAGES = [
  {
    from: "Acrylic UI",
    subject: "Registry review notes",
    preview: "The Shell primitive keeps app structure separate from Sidebar.",
    time: "9:42 AM",
    marker: Flag,
    active: true,
  },
  {
    from: "Mira Chen",
    subject: "Window shell sketches",
    preview: "I added a Mail-style split view and a Notes editor variant.",
    time: "8:15 AM",
    marker: Paperclip,
  },
  {
    from: "Design Systems",
    subject: "Source list density",
    preview: "Keep sidebar rows compact at 13px with muted counts.",
    time: "Yesterday",
    compact: true,
  },
  {
    from: "Tauri",
    subject: "Vibrancy pass",
    preview: "The backdrop is visible through the shell and sidebar surfaces.",
    time: "Mon",
    marker: Star,
  },
  {
    from: "Release",
    subject: "Docs capture",
    preview: "The preview should match the macOS mail frame before API polish.",
    time: "Jun 22",
    marker: Flag,
  },
  {
    from: "Preview Bot",
    subject: "Screenshot run",
    preview: "Playwright has a repeatable path for the docs shell page.",
    time: "Jun 21",
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

function MailListItem({ message }: { message: (typeof MESSAGES)[number] }) {
  return (
    <Item
      asChild
      size="xs"
      selected={message.active}
      className={[
        "h-[83px] w-full rounded-none px-5 py-2.5",
        "items-start gap-0 text-left",
        "focus-visible:relative focus-visible:z-10",
        message.compact && "h-[70px]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button type="button">
        <ItemContent className="flex h-full min-w-0 flex-col">
          <ItemRow className="h-4">
            <ItemTitle className="min-w-0 flex-1 text-[13px] font-semibold leading-4">
              {message.from}
            </ItemTitle>
            <ItemMeta className="pt-px text-[11px] leading-[13px]">
              {message.time}
            </ItemMeta>
          </ItemRow>
          <ItemRow className="mt-1 h-[13px]">
            <ItemTitle className="min-w-0 flex-1 text-[11px] font-medium leading-[13px]">
              {message.subject}
            </ItemTitle>
            <ItemAction className="h-3 w-3 pt-px text-muted-foreground [&>svg]:size-3">
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

export default function ShellMail() {
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
          className={[
            "transition-all duration-200 ease-out",
            expanded
              ? "h-full w-full rounded-none shadow-none"
              : "h-[500px] w-[800px] shrink-0 shadow-[0_18px_54px_rgba(0,0,0,0.28)]",
          ].join(" ")}
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

          <Sidebar
            collapsible="icon"
            className={expanded ? "w-[150px]" : "w-[150px] rounded-l-xl"}
          >
            <SidebarHeader className="h-[46px] px-2 pt-4">
              <div className="flex h-7 items-center gap-2">
                <div className="min-w-0 flex-1 truncate text-[12px] font-semibold group-data-[collapsible=icon]:hidden">
                  Mailboxes
                </div>
                <SidebarTrigger aria-label="Collapse mailboxes" />
              </div>
            </SidebarHeader>
            <SidebarContent className="scrollbar-mac px-2 pb-2 pt-0">
              <SidebarMenu>
                {MAILBOXES.map((mailbox) => (
                  <SidebarMenuItem key={mailbox.title}>
                    <SidebarMenuButton isActive={mailbox.active} size="sm">
                      <mailbox.icon />
                      <span>{mailbox.title}</span>
                    </SidebarMenuButton>
                    {mailbox.count > 0 ? (
                      <SidebarMenuBadge>{mailbox.count}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          <ShellInset>
            <ShellBody>
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
                    icon
                    variant="neutral"
                    size="large"
                    aria-label="New message"
                  >
                    <SquarePen />
                  </Button>
                </ShellPanelHeader>
                <ShellContent
                  padding="flush"
                  className="scrollbar-mac overflow-x-hidden pt-1"
                >
                  <div className="ml-2 w-[208px]">
                    {MESSAGES.map((message) => (
                      <MailListItem key={message.subject} message={message} />
                    ))}
                  </div>
                </ShellContent>
              </ShellPanel>

              <ShellPanel
                variant="detail"
                className={expanded ? "flex-1" : "w-[425px] flex-none"}
              >
                <ShellNavbar className="h-[49px] justify-between px-1.5">
                  <ButtonGroup variant="attached" size="large">
                    <Button
                      icon
                      variant="neutral"
                      size="large"
                      aria-label="Archive"
                    >
                      <Archive />
                    </Button>
                    <ButtonGroupSeparator />
                    <Button
                      icon
                      variant="neutral"
                      size="large"
                      aria-label="Archive junk"
                    >
                      <ArchiveX />
                    </Button>
                    <ButtonGroupSeparator />
                    <Button
                      icon
                      variant="neutral"
                      size="large"
                      aria-label="Delete"
                    >
                      <Trash2 />
                    </Button>
                  </ButtonGroup>
                  <div className="flex h-7 items-center gap-6">
                    <ButtonGroup variant="attached" size="large">
                      <Button
                        icon
                        variant="neutral"
                        size="large"
                        aria-label="Reply"
                      >
                        <Reply />
                      </Button>
                      <ButtonGroupSeparator />
                      <Button
                        icon
                        variant="neutral"
                        size="large"
                        aria-label="Reply all"
                      >
                        <Forward />
                      </Button>
                      <ButtonGroupSeparator />
                      <Button
                        icon
                        variant="neutral"
                        size="large"
                        aria-label="Flag"
                      >
                        <Flag />
                      </Button>
                    </ButtonGroup>
                    <div className="flex items-center gap-1">
                      <Button
                        icon
                        variant="neutral"
                        size="large"
                        aria-label="Previous message"
                      >
                        <ChevronLeft />
                      </Button>
                      <Button
                        icon
                        variant="neutral"
                        size="large"
                        aria-label="Next message"
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>
                </ShellNavbar>

                <ShellContent padding="flush" className="scrollbar-mac px-5 pt-4">
                  <article className={expanded ? "w-full" : "w-[384px]"}>
                    <header className="h-[67px] border-b border-[var(--acr-border-soft)]">
                      <div className="flex h-[50px] gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--acr-chip)] text-[11px] font-semibold text-foreground">
                          AU
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="grid grid-cols-[minmax(0,1fr)_40px] items-start gap-5">
                            <div className="truncate text-[13px] font-semibold leading-4">
                              Acrylic UI
                            </div>
                            <div className="pt-px text-[11px] leading-[13px] text-muted-foreground">
                              9:42 AM
                            </div>
                          </div>
                          <div className="mt-1 grid grid-cols-[minmax(0,1fr)_12px] items-start gap-2">
                            <div className="truncate text-[11px] font-medium leading-[13px]">
                              Registry review notes
                            </div>
                            <span className="mt-px text-muted-foreground">
                              <AppleIcon icon={Flag} size={12} strokeWidth={1.4} />
                            </span>
                          </div>
                          <div className="mt-1 truncate text-[11px] leading-[13px] text-muted-foreground">
                            The Shell primitive keeps app structure separate from Sidebar.
                          </div>
                        </div>
                      </div>
                    </header>

                    <div className="pt-4">
                      <div className="h-44 text-[13px] leading-6 text-foreground/85">
                        <p>
                          Shell owns the window structure. Sidebar remains the
                          source-list primitive, while the main panel can split
                          into list and detail panes at exact macOS frame sizes.
                        </p>
                        <p className="mt-3">
                          This Mail example uses Item for each message preview,
                          so density, truncation, and actions can be reused
                          without turning Shell into a mail-specific API.
                        </p>
                      </div>
                      <div className="h-[200px] rounded-[8px] border border-[var(--acr-border-soft)] bg-[linear-gradient(135deg,rgba(255,255,255,0.20),rgba(255,255,255,0.04)),var(--acr-card-nested)] shadow-[inset_0_1px_rgba(255,255,255,0.14)]" />
                    </div>
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
