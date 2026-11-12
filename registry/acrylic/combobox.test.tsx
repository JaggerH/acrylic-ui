import * as React from "react"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Combobox } from "./combobox"

afterEach(() => {
  cleanup()
})

const timezones = [
  { value: "Asia/Singapore", label: "Asia/Singapore (UTC+08:00)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (UTC+01:00)" },
  { value: "UTC", label: "UTC (UTC+00:00)" },
]

function Harness({ onValueChange }: { onValueChange?: (v: string) => void }) {
  const [value, setValue] = React.useState("Asia/Singapore")
  return (
    <Combobox
      aria-label="Workspace time zone"
      options={timezones}
      value={value}
      onValueChange={(v) => {
        setValue(v)
        onValueChange?.(v)
      }}
      placeholder="Pick…"
      searchPlaceholder="Search…"
    />
  )
}

describe("Combobox", () => {
  it("exposes an accessible name on the trigger via aria-label", () => {
    render(<Harness />)
    expect(screen.getByRole("combobox", { name: "Workspace time zone" })).toBeTruthy()
  })

  it("shows the selected option's label", () => {
    render(<Harness />)
    expect(screen.getByRole("combobox", { name: "Workspace time zone" })).toHaveTextContent("Asia/Singapore (UTC+08:00)")
  })

  it("filters options by typing and commits a new value", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Harness onValueChange={onValueChange} />)
    await user.click(screen.getByRole("combobox", { name: "Workspace time zone" }))
    const input = screen.getByPlaceholderText("Search…")
    await user.type(input, "berlin")
    const option = await screen.findByText("Europe/Berlin (UTC+01:00)")
    await user.click(option)
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("Europe/Berlin"))
  })

  it("re-selecting the current value keeps it (no accidental deselect)", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Harness onValueChange={onValueChange} />)
    await user.click(screen.getByRole("combobox", { name: "Workspace time zone" }))
    const option = screen.getAllByText("Asia/Singapore (UTC+08:00)").find((el) => el.getAttribute("data-slot") === "command-item") ?? screen.getAllByText("Asia/Singapore (UTC+08:00)")[1]!
    await user.click(option)
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("Asia/Singapore"))
  })
})
