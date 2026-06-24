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

// The shadcn/ui "Card · Image" example, ported onto the acrylic Card composition:
// same structure (flush cover image under a scrim, Featured badge as CardAction,
// title + description, full-width footer action) — but the Card is the frosted
// glass surface, so the body shows the wallpaper through. The Card has no padding
// of its own, so we add shadcn's `flex flex-col gap-6 py-6` layout (pt-0 lets the
// image sit flush at the top).
export default function CardCover() {
  return (
    <ExampleBackdrop>
      <Card className="relative mx-auto flex w-full max-w-sm flex-col gap-6 overflow-hidden py-6 pt-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://avatar.vercel.sh/shadcn1"
          alt="Event cover"
          className="aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 aspect-video bg-black/35" />

        <CardHeader>
          <CardAction>
            <Badge variant="secondary">Featured</Badge>
          </CardAction>
          <CardTitle>Design systems meetup</CardTitle>
          <CardDescription>
            A practical talk on component APIs, accessibility, and shipping faster.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full">View Event</Button>
        </CardFooter>
      </Card>
    </ExampleBackdrop>
  )
}
