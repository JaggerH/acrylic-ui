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
  ItemSeparator,
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
      ]
        .filter(Boolean)
        .join(" ")}
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

export default function ShellMail() {
  const [expanded, setExpanded] = React.useState(false)
  const [selectedSubject, setSelectedSubject] = React.useState(MESSAGES[0].subject)
  const ExpandIcon = expanded ? Minimize2 : Maximize2
  const selectedMessage =
    MESSAGES.find((message) => message.subject === selectedSubject) ?? MESSAGES[0]

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
          sidebarWidth={150}
          sidebarCollapsedWidth={48}
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
            className={expanded ? undefined : "rounded-l-xl"}
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
                        <React.Fragment key={message.subject}>
                          <MailListItem
                            message={message}
                            selected={message.subject === selectedSubject}
                            onSelect={() => setSelectedSubject(message.subject)}
                          />
                          {showSeparator ? (
                            <ItemSeparator className="mx-3" />
                          ) : null}
                        </React.Fragment>
                      )
                    })}
                  </div>
                </ShellContent>
              </ShellPanel>

              <ShellPanel
                variant="detail"
                className="min-w-[425px] flex-1"
              >
                <ShellNavbar className="h-[49px] justify-between px-1.5">
                  <ButtonGroup variant="ghost" size="large" shape="rect">
                    <Button
                      icon
                      variant="ghost"
                      size="large"
                      aria-label="Archive"
                    >
                      <Archive />
                    </Button>
                    <ButtonGroupSeparator />
                    <Button
                      icon
                      variant="ghost"
                      size="large"
                      aria-label="Archive junk"
                    >
                      <ArchiveX />
                    </Button>
                    <ButtonGroupSeparator />
                    <Button
                      icon
                      variant="ghost"
                      size="large"
                      aria-label="Delete"
                    >
                      <Trash2 />
                    </Button>
                  </ButtonGroup>
                  <div className="flex h-7 items-center gap-6">
                    <ButtonGroup variant="ghost" size="large" shape="rect">
                      <Button
                        icon
                        variant="ghost"
                        size="large"
                        aria-label="Reply"
                      >
                        <Reply />
                      </Button>
                      <ButtonGroupSeparator />
                      <Button
                        icon
                        variant="ghost"
                        size="large"
                        aria-label="Reply all"
                      >
                        <Forward />
                      </Button>
                      <ButtonGroupSeparator />
                      <Button
                        icon
                        variant="ghost"
                        size="large"
                        aria-label="Flag"
                      >
                        <Flag />
                      </Button>
                    </ButtonGroup>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="medium"
                        aria-label="Previous message"
                        className="h-7 w-9 rounded-[6px] px-0"
                      >
                        <ChevronLeft />
                      </Button>
                      <Button
                        variant="ghost"
                        size="medium"
                        aria-label="Next message"
                        className="h-7 w-9 rounded-[6px] px-0"
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>
                </ShellNavbar>

                <ShellContent padding="flush" className="scrollbar-mac px-5 pt-4">
                  <article className="w-full">
                    <header className="h-[67px] border-b border-[var(--acr-border-soft)]">
                      <div className="flex h-[50px] gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--acr-chip)] text-[11px] font-semibold text-foreground">
                          {selectedMessage.initials}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="grid grid-cols-[minmax(0,1fr)_40px] items-start gap-5">
                            <div className="truncate text-[13px] font-semibold leading-4">
                              {selectedMessage.from}
                            </div>
                            <div className="pt-px text-[11px] leading-[13px] text-muted-foreground">
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
            </ShellBody>
          </ShellInset>
        </Shell>
      </div>
    </ExampleBackdrop>
  )
}
