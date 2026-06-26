import { FileText } from "lucide-react"

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/acrylic/item"

const sizes = ["default", "sm", "xs"] as const

export default function ItemSizesDemo() {
  return (
    <ItemGroup className="w-full max-w-md">
      {sizes.map((size) => (
        <Item key={size} size={size} variant="outline">
          <ItemMedia variant="icon">
            <FileText />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{size}</ItemTitle>
            <ItemDescription>Compact row geometry for {size} items.</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}
