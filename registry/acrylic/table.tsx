"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// Acrylic Table — shadcn's Table, recolored to the Acrylic macOS material.
//
// Acrylic delta vs shadcn:
//  - Flat glass citizen: no own surface. It sits transparently on whatever it is
//    dropped into and composes inside <Card>; depth comes from the container.
//  - Hairline row separators on --acr-border-soft (header row on the firmer
//    --acr-border); hover tint --acr-hover; selected row --acr-chip.
//  - Row hover is wired onto the spring substrate (color transition only — a row
//    is not a press target, so NO active:scale).
//  - Column labels use the small subheadline size + its tracking companion,
//    muted (text-muted-foreground), Apple label style.
//  - Horizontal overflow uses the macOS thin overlay scrollbar (scrollbar-mac).
//
// Anatomy is shadcn 1:1 — compose Table > TableHeader/TableBody/TableFooter,
// each holding TableRow, cells are TableHead (header) / TableCell (body).
// Right-align numeric columns with className="text-right" on both head and cell.

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto scrollbar-mac"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom border-collapse text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b [&_tr]:border-b-[var(--acr-border)]", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-t-[var(--acr-border)] bg-[var(--acr-chip)] font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-b-[var(--acr-border-soft)] transition-colors [transition-timing-function:var(--acr-spring-default)] [transition-duration:var(--acr-spring-default-duration)] hover:bg-[var(--acr-hover)] data-[state=selected]:bg-[var(--acr-chip)]",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-9 px-3 text-left align-middle font-medium whitespace-nowrap text-muted-foreground text-[length:var(--text-subheadline)] [letter-spacing:var(--text-subheadline-tracking)] [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-3 py-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-muted-foreground text-[length:var(--text-footnote)] [letter-spacing:var(--text-footnote-tracking)]", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
}
