import { Badge } from "@/registry/acrylic/badge"

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-foreground">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  )
}
