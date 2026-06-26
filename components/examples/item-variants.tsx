import { Bell } from "lucide-react"

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/acrylic/item"

const variants = ["default", "outline", "muted"] as const

export default function ItemVariantsDemo() {
  return (
    <ItemGroup className="w-full max-w-md">
      {variants.map((variant) => (
        <Item key={variant} variant={variant}>
          <ItemMedia variant="icon">
            <Bell />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{variant}</ItemTitle>
            <ItemDescription>Rendered with the {variant} item variant.</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}
