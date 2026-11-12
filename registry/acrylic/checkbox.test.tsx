import * as React from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Checkbox } from "./checkbox"

afterEach(cleanup)

describe("Checkbox", () => {
  it("toggles and reports the new state to onCheckedChange", () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox aria-label="Enable" onCheckedChange={onCheckedChange} />)

    const box = screen.getByRole("checkbox", { name: "Enable" })
    expect(box).toHaveAttribute("aria-checked", "false")

    fireEvent.click(box)
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
    expect(box).toHaveAttribute("aria-checked", "true")

    fireEvent.click(box)
    expect(onCheckedChange).toHaveBeenLastCalledWith(false)
    expect(box).toHaveAttribute("aria-checked", "false")
  })

  it("toggles with the space key", async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox aria-label="Enable" onCheckedChange={onCheckedChange} />)

    screen.getByRole("checkbox", { name: "Enable" }).focus()
    await userEvent.keyboard("[Space]")

    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it("stays at its controlled state while still reporting the request", () => {
    const onCheckedChange = vi.fn()
    const { rerender } = render(
      <Checkbox aria-label="Enable" checked={false} onCheckedChange={onCheckedChange} />
    )

    const box = screen.getByRole("checkbox", { name: "Enable" })
    fireEvent.click(box)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(box).toHaveAttribute("aria-checked", "false")

    rerender(<Checkbox aria-label="Enable" checked={true} onCheckedChange={onCheckedChange} />)
    expect(box).toHaveAttribute("aria-checked", "true")
  })

  it("does not respond when disabled", () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox aria-label="Enable" disabled onCheckedChange={onCheckedChange} />)

    fireEvent.click(screen.getByRole("checkbox", { name: "Enable" }))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it("renders the mixed (indeterminate) state", () => {
    render(<Checkbox aria-label="Enable" checked="indeterminate" />)

    const box = screen.getByRole("checkbox", { name: "Enable" })
    expect(box).toHaveAttribute("aria-checked", "mixed")
    expect(box.querySelector('[data-slot="checkbox-indicator"]')).toBeTruthy()
  })

  it("exposes the chosen size", () => {
    render(<Checkbox aria-label="Large" size="large" />)
    expect(screen.getByRole("checkbox", { name: "Large" }).dataset.size).toBe("large")
  })
})
