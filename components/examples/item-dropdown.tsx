"use client"

import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/registry/acrylic/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/acrylic/dropdown-menu"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/registry/acrylic/item"

export default function ItemDropdownDemo() {
  return (
    <ItemGroup className="w-full max-w-md">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Select</ItemTitle>
          <ItemDescription>Choose an option from the menu.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="small">
                Select
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Option One</DropdownMenuItem>
              <DropdownMenuItem>Option Two</DropdownMenuItem>
              <DropdownMenuItem>Option Three</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      </Item>
    </ItemGroup>
  )
}
