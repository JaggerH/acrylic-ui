import { ShieldAlertIcon } from "lucide-react"

import { Button } from "@/registry/acrylic/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/acrylic/item"

export default function ItemActionsDemo() {
  return (
    <ItemGroup className="w-full max-w-md">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <ShieldAlertIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Security Alert</ItemTitle>
          <ItemDescription>New login detected from unknown device.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="secondary" size="small">Review</Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  )
}
