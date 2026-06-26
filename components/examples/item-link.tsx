import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react"

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/registry/acrylic/item"

export default function ItemLinkDemo() {
  return (
    <ItemGroup className="w-full max-w-md">
      <Item asChild variant="outline">
        <a href="https://ui.shadcn.com/docs" target="_blank" rel="noreferrer">
          <ItemContent>
            <ItemTitle>Visit our documentation</ItemTitle>
            <ItemDescription>Learn how to get started with our components.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <ExternalLinkIcon className="size-4 text-muted-foreground" />
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          </ItemActions>
        </a>
      </Item>
      <Item asChild variant="outline">
        <a href="https://ui.shadcn.com/docs/components/item" target="_blank" rel="noreferrer">
          <ItemContent>
            <ItemTitle>External resource</ItemTitle>
            <ItemDescription>Opens in a new tab with security attributes.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <ExternalLinkIcon className="size-4 text-muted-foreground" />
          </ItemActions>
        </a>
      </Item>
    </ItemGroup>
  )
}
