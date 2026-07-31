import * as React from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Sheet, SheetContent, SheetTitle } from "./sheet"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

/** Stand in for the browser's selection state. `collapsed: true` = nothing selected. */
function mockSelection(collapsed: boolean) {
  vi.spyOn(window, "getSelection").mockReturnValue({
    isCollapsed: collapsed,
  } as unknown as Selection)
}

function renderOpenSheet() {
  render(
    <Sheet open>
      <SheetContent side="right">
        <SheetTitle>标题</SheetTitle>
        <p>可以选中的正文。</p>
      </SheetContent>
    </Sheet>
  )
  const panel = document.querySelector('[data-slot="sheet-content"]')
  if (!panel) throw new Error("expected the sheet panel to be in the document")
  // The drag commit is observable exactly here: committing grabs the pointer,
  // and grabbing the pointer is what kills a native text selection.
  const capture = vi.fn()
  // Assign directly — jsdom has no pointer capture, and fireEvent's `target`
  // init key would splat properties onto the element instead of retargeting.
  ;(panel as HTMLElement & { setPointerCapture: unknown }).setPointerCapture = capture
  return { panel, capture }
}

/** Press ON THE BODY TEXT (events bubble to the panel's handler, so `e.target`
 *  is the paragraph — the real shape of "user drags across a sentence"), then
 *  move well past DRAG_THRESHOLD (5px). */
function pressAndDrag(distance = 40) {
  const text = screen.getByText("可以选中的正文。")
  fireEvent.pointerDown(text, { button: 0, clientX: 0, clientY: 0 })
  fireEvent.pointerMove(text, { clientX: distance, clientY: 0, pointerId: 1 })
}

describe("Sheet drag vs. native text selection", () => {
  // The bug this pins: the gesture layer claimed every pointer-down outside form
  // controls, so dragging to select body text slid the whole panel away instead.
  // The panel is the only thing in the app that can steal a selection this way,
  // because committing the drag calls setPointerCapture.
  it("does not start a drag while the user is selecting text", () => {
    mockSelection(false) // a selection formed under the pointer
    const { capture } = renderOpenSheet()

    pressAndDrag()

    expect(capture).not.toHaveBeenCalled()
  })

  it("still drags when the gesture selects nothing (padding, chrome, touch)", () => {
    mockSelection(true) // nothing got selected — this is a real drag
    const { capture } = renderOpenSheet()

    pressAndDrag()

    expect(capture).toHaveBeenCalled()
  })

  it("ignores movement below the drag threshold either way", () => {
    mockSelection(true)
    const { capture } = renderOpenSheet()

    const text = screen.getByText("可以选中的正文。")
    fireEvent.pointerDown(text, { button: 0, clientX: 0, clientY: 0 })
    fireEvent.pointerMove(text, { clientX: 3, clientY: 0, pointerId: 1 })

    expect(capture).not.toHaveBeenCalled()
  })
})
