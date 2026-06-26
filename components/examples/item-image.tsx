import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/acrylic/item"

const songs = [
  {
    title: "Midnight City Lights",
    artist: "Electric Nights",
    album: "Neon Dreams",
    duration: "3:45",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=200&auto=format&fit=crop",
  },
  {
    title: "Coffee Shop Conversations",
    artist: "Urban Stories",
    album: "The Morning Brew",
    duration: "4:05",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=200&auto=format&fit=crop",
  },
  {
    title: "Digital Rain",
    artist: "Binary Beats",
    album: "Cyber Symphony",
    duration: "3:30",
    image:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=200&auto=format&fit=crop",
  },
]

export default function ItemImageDemo() {
  return (
    <ItemGroup className="w-full max-w-md">
      {songs.map((song) => (
        <Item key={song.title} variant="outline">
          <ItemMedia variant="image">
            <img src={song.image} alt="" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{song.title}</ItemTitle>
            <ItemDescription>
              {song.artist} · {song.album}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <span className="text-xs text-muted-foreground">{song.duration}</span>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  )
}
