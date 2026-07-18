"use client"

import { Badge } from "@/registry/acrylic/badge"
import { Button } from "@/registry/acrylic/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/acrylic/card"
import { ExampleBackdrop } from "@/components/example-backdrop"

// An App Store Today / Apple TV -style cover card on the acrylic Card composition:
// a flush, full-bleed photograph up top, a Live badge as CardAction, title +
// description, and a full-width footer action. The Card is the frosted glass
// surface, so the body shows the wallpaper through. The Card has no padding of its
// own, so we add `flex flex-col gap-6 py-6` (pt-0 lets the photo sit flush at top).
// A real photograph carries the card — no grayscale/brightness crutches; a light
// top scrim only lifts the depth where the media meets the frosted body.
export default function CardCover() {
  return (
    <ExampleBackdrop>
      <Card className="relative mx-auto flex w-full max-w-sm flex-col gap-6 overflow-hidden py-6 pt-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://picsum.photos/seed/sunsetset/640/360"
          alt="Concert cover"
          className="aspect-video w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 aspect-video bg-gradient-to-b from-black/20 to-transparent" />

        <CardHeader>
          <CardAction>
            <Badge variant="secondary">Live</Badge>
          </CardAction>
          <CardTitle>Sunset Sessions</CardTitle>
          <CardDescription>
            Ólafur Arnalds, live from Reykjavík — tonight at 9:00.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full">Set Reminder</Button>
        </CardFooter>
      </Card>
    </ExampleBackdrop>
  )
}
