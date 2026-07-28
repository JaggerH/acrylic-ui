import { Card } from "@/registry/acrylic/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/acrylic/table"

const tracks = [
  { n: 1, title: "Ventura Highway", album: "Homecoming", time: "3:31" },
  { n: 2, title: "Tin Man", album: "Holiday", time: "3:28" },
  { n: 3, title: "Sister Golden Hair", album: "Hearts", time: "3:19" },
  { n: 4, title: "A Horse with No Name", album: "America", time: "4:08" },
  { n: 5, title: "I Need You", album: "America", time: "3:07" },
  { n: 6, title: "Lonely People", album: "Holiday", time: "2:29" },
  { n: 7, title: "Daisy Jane", album: "Hearts", time: "3:09" },
  { n: 8, title: "Woman Tonight", album: "Hearts", time: "2:39" },
  { n: 9, title: "Only in Your Heart", album: "Homecoming", time: "3:02" },
  { n: 10, title: "Don't Cross the River", album: "Homecoming", time: "2:31" },
]

export default function TableSticky() {
  return (
    <Card className="w-full max-w-xl p-2 text-foreground">
      {/* The Card's padded, rounded box is the scroll container — so the table
          renders bare (no wrapper of its own) and the header sticks to THIS. */}
      <div className="scrollbar-mac max-h-64 overflow-y-auto">
        <Table scrollable={false}>
          <TableHeader sticky>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Album</TableHead>
              <TableHead className="w-16 text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tracks.map((t) => (
              <TableRow key={t.n}>
                <TableCell className="text-center text-muted-foreground">{t.n}</TableCell>
                <TableCell className="font-medium">{t.title}</TableCell>
                <TableCell className="text-muted-foreground">{t.album}</TableCell>
                <TableCell className="text-right text-muted-foreground">{t.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
