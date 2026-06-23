"use client"

import { Card } from "@/registry/acrylic/card"
import { ExampleBackdrop } from "@/components/example-backdrop"

export default function CardDemo() {
  return (
    <ExampleBackdrop>
      <div className="grid w-full max-w-md grid-cols-2 gap-4 text-foreground">
        <Card className="p-5">
          <div className="text-sm font-medium">Static</div>
          <p className="mt-1 text-xs text-muted-foreground">Flat, no shadow.</p>
        </Card>
        <Card interactive className="p-5">
          <div className="text-sm font-medium">Interactive</div>
          <p className="mt-1 text-xs text-muted-foreground">Hover to lift.</p>
        </Card>
      </div>
    </ExampleBackdrop>
  )
}
