import * as React from "react"

import { cn } from "@/lib/utils"

// Acrylic input — the Muse's search field: a translucent dark pill with a
// defined hairline border, muted placeholder, soft focus ring. Compose a leading
// icon by wrapping it (see the Input docs example); the field stays a plain
// <input>. Deliberately NO `backdrop-blur` of its own: it sits inside already-
// blurred chrome (topbar / card), and a second nested backdrop-filter paints a
// hazy rectangle behind the field (artifact) instead of frosting cleanly.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-8 w-full min-w-0 rounded-md border border-[var(--acr-border)] bg-[var(--acr-field)] px-2.5 py-1 text-sm text-foreground outline-none transition-colors",
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "hover:border-[var(--acr-control-border)] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
