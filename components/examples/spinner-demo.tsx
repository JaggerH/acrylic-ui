import * as React from "react"
import { Spinner } from "@/registry/acrylic/spinner"
import { ExampleBackdrop } from "@/components/example-backdrop"

export default function SpinnerDemo() {
  return (
    <ExampleBackdrop className="flex-col gap-8">
      <div className="flex items-center gap-6 rounded-2xl bg-[var(--acr-toast)] p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col items-center gap-2">
          <Spinner size={16} />
          <span className="text-[10px] text-muted-foreground font-medium">16px</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Spinner size={24} className="text-primary" />
          <span className="text-[10px] text-muted-foreground font-medium">24px</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Spinner size={32} className="text-[var(--acr-green)]" />
          <span className="text-[10px] text-muted-foreground font-medium">32px</span>
        </div>
      </div>
    </ExampleBackdrop>
  )
}
