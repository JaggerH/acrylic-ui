"use client"

import { useState, type ReactNode } from "react"
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock"

/** Preview / Code tabbed block. Preview renders the live example; Code shows its
 *  source. Chrome uses Fumadocs `fd-*` tokens so it matches the docs UI. */
export function PreviewTabs({ source, children }: { source: string; children: ReactNode }) {
  const [tab, setTab] = useState<"preview" | "code">("preview")
  const tabCls = (active: boolean) =>
    "rounded-md px-2.5 py-1 text-sm font-medium transition-colors " +
    (active
      ? "bg-fd-primary/10 text-fd-foreground"
      : "text-fd-muted-foreground hover:text-fd-foreground")

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-fd-border">
      <div className="flex gap-1 border-b border-fd-border bg-fd-card px-2 py-1.5">
        <button type="button" onClick={() => setTab("preview")} className={tabCls(tab === "preview")}>
          Preview
        </button>
        <button type="button" onClick={() => setTab("code")} className={tabCls(tab === "code")}>
          Code
        </button>
      </div>
      <div
        hidden={tab !== "preview"}
        className="flex min-h-44 items-center justify-center p-10"
      >
        {children}
      </div>
      <div hidden={tab !== "code"}>
        <DynamicCodeBlock
          lang="tsx"
          code={source}
          codeblock={{ className: "my-0 rounded-none border-0" }}
        />
      </div>
    </div>
  )
}
