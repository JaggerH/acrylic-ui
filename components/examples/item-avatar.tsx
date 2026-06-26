import { PlusIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/registry/acrylic/avatar"
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

export default function ItemAvatarDemo() {
  return (
    <ItemGroup className="w-full max-w-md">
      <Item variant="outline">
        <ItemMedia variant="avatar">
          <Avatar>
            <AvatarFallback>ER</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Evil Rabbit</ItemTitle>
          <ItemDescription>Last seen 5 months ago</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline">
        <ItemMedia variant="avatar" className="mr-1 w-[4.25rem] justify-start">
          <div className="flex [&>[data-slot=avatar]+[data-slot=avatar]]:-ml-2">
            <Avatar className="size-7 border border-[var(--acr-surface)]">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar className="size-7 border border-[var(--acr-surface)]">
              <AvatarFallback>LR</AvatarFallback>
            </Avatar>
            <Avatar className="size-7 border border-[var(--acr-surface)]">
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>No Team Members</ItemTitle>
          <ItemDescription>Invite your team to collaborate on this project.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="secondary" size="small">
            <PlusIcon />
            Invite
          </Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  )
}
