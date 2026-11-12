import * as React from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Searchbar } from "./searchbar"

afterEach(cleanup)

/** The pill root; the input and the icon both live inside it. */
function root() {
  const el = document.querySelector('[data-slot="searchbar"]')
  if (!el) throw new Error("expected the searchbar root to be in the document")
  return el as HTMLElement
}

describe("Searchbar clear button", () => {
  it("appears only once there is content, and clears an uncontrolled value", () => {
    render(<Searchbar placeholder="Search" />)
    const input = screen.getByPlaceholderText("Search") as HTMLInputElement
    expect(root().querySelector("button")).toBeNull()

    fireEvent.change(input, { target: { value: "design" } })
    expect(input.value).toBe("design")

    fireEvent.click(screen.getByRole("button", { name: "Clear" }))
    expect(input.value).toBe("")
    expect(root().querySelector("button")).toBeNull()
  })

  it("has an accessible name, localisable through clearLabel", () => {
    const onClear = vi.fn()
    render(<Searchbar placeholder="Search" value="design" clearLabel="清除" onClear={onClear} onChange={() => {}} />)

    fireEvent.click(screen.getByRole("button", { name: "清除" }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it("calls onChange with an empty value so a controlled host resets too", () => {
    const onChange = vi.fn()
    render(<Searchbar placeholder="Search" value="design" onChange={onChange} />)

    fireEvent.click(screen.getByRole("button", { name: "Clear" }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0]![0].target.value).toBe("")
  })
})

describe("Searchbar shortcut hint", () => {
  it("shows the keycap while empty and hides it once there is content", () => {
    const { rerender } = render(<Searchbar placeholder="Search" value="" shortcut="⌘K" onChange={() => {}} />)
    expect(screen.getByText("⌘K")).toBeTruthy()

    rerender(<Searchbar placeholder="Search" value="design" shortcut="⌘K" onChange={() => {}} />)
    expect(screen.queryByText("⌘K")).toBeNull()
    expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy()
  })
})
