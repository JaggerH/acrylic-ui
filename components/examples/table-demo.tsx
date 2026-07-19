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
            <TableRow key={row.plan}>
              <TableCell className="font-medium">{row.plan}</TableCell>
              <TableCell className="text-muted-foreground">{row.detail}</TableCell>
              <TableCell className="text-muted-foreground">{row.period}</TableCell>
              <TableCell className="text-right tabular-nums">{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right tabular-nums">$37.96</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  )
}
