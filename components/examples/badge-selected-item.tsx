import { Bell } from "lucide-react"

import { Badge } from "@/registry/acrylic/badge"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemMeta,
  ItemRow,
  ItemTitle,
} from "@/registry/acrylic/item"

const ROWS = [
  { variant: "secondary" as const, label: "Draft", selected: false },
  { variant: "secondary" as const, label: "Draft", selected: true },
  { variant: "outline" as const, label: "Draft", selected: false },
  { variant: "outline" as const, label: "Draft", selected: true },
]

export default function BadgeSelectedItem() {
  return (
    <ItemGroup className="w-full max-w-md">
      {ROWS.map((row, i) => (
        <Item
          key={i}
          selected={row.selected}
          className={[
            "data-[selected=true]:bg-primary",
            "data-[selected=true]:text-primary-foreground",
            "[&[data-selected=true]_[data-slot=item-title]]:text-primary-foreground",
            "[&[data-selected=true]_[data-slot=item-description]]:text-primary-foreground/80",
          ].join(" ")}
        >
          <ItemMedia variant="icon">
            <Bell />
          </ItemMedia>
          <ItemContent>
            <ItemRow className="items-center">
              <ItemTitle className="min-w-0 flex-1">
                {row.variant} · {row.selected ? "selected" : "resting"}
              </ItemTitle>
              <ItemMeta>
                <Badge variant={row.variant}>{row.label}</Badge>
              </ItemMeta>
            </ItemRow>
            <ItemDescription>
              The badge reads group-data-[selected=true]/item: on its own — no
              extra className on the Badge itself.
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}
