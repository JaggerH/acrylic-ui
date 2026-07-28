"use client"

import * as React from "react"

import { Card } from "@/registry/acrylic/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/acrylic/table"

const invoices = [
  { plan: "iCloud+", detail: "2 TB storage", period: "Monthly", amount: "$9.99" },
  { plan: "Apple Music", detail: "Individual", period: "Monthly", amount: "$10.99" },
  { plan: "Apple TV+", detail: "Family sharing", period: "Monthly", amount: "$9.99" },
  { plan: "Apple Arcade", detail: "200+ games", period: "Monthly", amount: "$6.99" },
]

export default function TableDemo() {
  // Click a row to select it — selection is shadcn's contract, unchanged:
  // data-state="selected" is what swaps the neutral hover pill for the accent one.
  const [selected, setSelected] = React.useState("Apple Music")

  return (
    <Card className="w-full max-w-xl p-2 text-foreground">
      <Table>
        <TableCaption>Your Apple subscriptions this month.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Detail</TableHead>
            <TableHead>Billing</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((row) => (
            <TableRow
              key={row.plan}
              data-state={selected === row.plan ? "selected" : undefined}
              aria-selected={selected === row.plan}
              tabIndex={0}
              className="cursor-default outline-none focus-visible:[&>td]:bg-[var(--acr-hover)]"
              onClick={() => setSelected(row.plan)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setSelected(row.plan)
                }
              }}
            >
              <TableCell className="font-medium">{row.plan}</TableCell>
              <TableCell className="text-muted-foreground group-data-[state=selected]/table-row:text-primary-foreground/70!">
                {row.detail}
              </TableCell>
              <TableCell className="text-muted-foreground group-data-[state=selected]/table-row:text-primary-foreground/70!">
                {row.period}
              </TableCell>
              <TableCell className="text-right">{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">$37.96</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  )
}
