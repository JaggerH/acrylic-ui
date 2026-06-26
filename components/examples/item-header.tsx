import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/registry/acrylic/item"

const models = [
  {
    name: "v0-1.5-sm",
    description: "Everyday tasks and UI generation.",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=240&auto=format&fit=crop",
  },
  {
    name: "v0-1.5-lg",
    description: "Advanced thinking or reasoning.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=240&auto=format&fit=crop",
  },
  {
    name: "v0-2.0-mini",
    description: "Open Source model for everyone.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=240&auto=format&fit=crop",
  },
]

export default function ItemHeaderDemo() {
  return (
    <ItemGroup className="w-full max-w-md">
      {models.map((model) => (
        <Item key={model.name} variant="outline">
          <ItemHeader>
            <ItemMedia variant="image" className="h-28 w-full">
              <img src={model.image} alt="" />
            </ItemMedia>
          </ItemHeader>
          <ItemContent>
            <ItemTitle>{model.name}</ItemTitle>
            <ItemDescription>{model.description}</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}
