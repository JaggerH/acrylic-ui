"use client"

import { useState, type ReactNode } from "react"
import { Bell, Copy, MoreHorizontal, Plus, Scissors, Trash2 } from "lucide-react"
import { toast } from "@/registry/acrylic/sonner"

import { Button, buttonVariants } from "@/registry/acrylic/button"
import {
  ButtonGroup,
  ButtonGroupItem,
  ButtonGroupToggle,
  ButtonGroupSeparator,
} from "@/registry/acrylic/button-group"
import { Badge } from "@/registry/acrylic/badge"
import { Input } from "@/registry/acrylic/input"
import { Switch } from "@/registry/acrylic/switch"
import { Slider } from "@/registry/acrylic/slider"
import { RadioGroup, RadioGroupItem } from "@/registry/acrylic/radio-group"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/registry/acrylic/dialog"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/registry/acrylic/alert-dialog"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/registry/acrylic/sheet"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/registry/acrylic/popover"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/acrylic/select"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/registry/acrylic/context-menu"

// Shared, single-source component gallery — the "Components" pane of the sidebar
// demo. Rendered verbatim by the web landing demo and the Tauri playground (the
// only difference between those hosts is the Backdrop: web paints a wallpaper,
// Tauri goes transparent for native vibrancy). Built to grow: drop more Sections in.

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  )
}

export function ComponentsGallery() {
  const [seg, setSeg] = useState("week")

  return (
    <div className="flex max-w-4xl flex-col gap-8 p-6">
        <Section title="Buttons">
          <Button>Default</Button>
          <Button variant="neutral">Neutral</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
          <Button variant="ghost" icon aria-label="More">
            <MoreHorizontal />
          </Button>
          <Button size="small">Small</Button>
          <Button size="large">Large</Button>
        </Section>

        <Section title="Button Group — segmented">
          <ButtonGroup variant="segmented" value={seg} onValueChange={setSeg}>
            <ButtonGroupItem value="day">Day</ButtonGroupItem>
            <ButtonGroupItem value="week">Week</ButtonGroupItem>
            <ButtonGroupItem value="month">Month</ButtonGroupItem>
          </ButtonGroup>
          <ButtonGroup variant="attached">
            <Button variant="neutral" icon aria-label="minus">
              −
            </Button>
            <ButtonGroupSeparator />
            <Button variant="neutral" icon aria-label="plus">
              <Plus />
            </Button>
          </ButtonGroup>
          <ButtonGroup type="multiple" defaultValue={["b"]}>
            <ButtonGroupToggle value="b">B</ButtonGroupToggle>
            <ButtonGroupSeparator />
            <ButtonGroupToggle value="i">I</ButtonGroupToggle>
            <ButtonGroupSeparator />
            <ButtonGroupToggle value="u">U</ButtonGroupToggle>
          </ButtonGroup>
        </Section>

        <Section title="Badges">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ghost">Ghost</Badge>
        </Section>

        <Section title="Form controls">
          <Input placeholder="Input" className="w-44" />
          <Input placeholder="Disabled" className="w-32" disabled />
          <Switch defaultChecked />
          <Switch />
          <Slider defaultValue={[40]} max={100} step={1} className="w-44" />
          <RadioGroup defaultValue="a" className="flex gap-3">
            <label className="flex items-center gap-1.5 text-[13px]">
              <RadioGroupItem value="a" /> One
            </label>
            <label className="flex items-center gap-1.5 text-[13px]">
              <RadioGroupItem value="b" /> Two
            </label>
          </RadioGroup>
        </Section>

        <Section title="Overlays (open over the native acrylic)">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>Frosted overlay over the app.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 py-1">
                <Input placeholder="Name" defaultValue="Jagger" />
                <Input placeholder="Username" defaultValue="@jagger" />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="neutral">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Save</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Alert dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[380px]">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete item?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={buttonVariants({ variant: "destructive", size: "large" })}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="neutral">Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Side sheet</SheetTitle>
                <SheetDescription>A right-anchored panel.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="neutral">Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <p className="text-[13px] text-muted-foreground">A frosted floating panel.</p>
            </PopoverContent>
          </Popover>

          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Pick a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="cherry">Cherry</SelectItem>
            </SelectContent>
          </Select>

          <ContextMenu>
            <ContextMenuTrigger className="flex h-9 items-center rounded-md border border-dashed border-[var(--acr-border)] px-3 text-[13px] text-muted-foreground">
              Right-click me
            </ContextMenuTrigger>
            <ContextMenuContent className="w-44">
              <ContextMenuLabel>Actions</ContextMenuLabel>
              <ContextMenuItem>
                <Copy className="size-4" /> Copy
              </ContextMenuItem>
              <ContextMenuItem>
                <Scissors className="size-4" /> Cut
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem className="text-destructive">
                <Trash2 className="size-4" /> Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </Section>

        <Section title="Feedback">
          <Button
            variant="neutral"
            onClick={() =>
              toast("Acrylic", {
                description: "A frosted notification banner.",
                icon: <Bell />,
                variant: "icon",
              })
            }
          >
            Show toast
          </Button>
        </Section>
      </div>
  )
}

export default ComponentsGallery
