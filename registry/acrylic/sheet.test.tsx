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

/** jsdom gives every element scrollHeight/clientHeight of 0, so a "scrollable"
 *  element has to be declared. `top` is where it currently sits. */
function makeScrollable(el: Element, { top }: { top: number }) {
  Object.defineProperty(el, "scrollHeight", { value: 1000, configurable: true })
  Object.defineProperty(el, "clientHeight", { value: 400, configurable: true })
  Object.defineProperty(el, "scrollTop", { value: top, writable: true, configurable: true })
}

function renderBottomSheet() {
  render(
    <Sheet open>
      <SheetContent side="bottom">
        <SheetTitle>标题</SheetTitle>
        <div data-testid="scroller">
          <p>很长的正文。</p>
        </div>
      </SheetContent>
    </Sheet>
  )
  const panel = document.querySelector('[data-slot="sheet-content"]')
  if (!panel) throw new Error("expected the sheet panel to be in the document")
  const capture = vi.fn()
  ;(panel as HTMLElement & { setPointerCapture: unknown }).setPointerCapture = capture
  return { panel, capture, scroller: screen.getByTestId("scroller") }
}

/** A vertical gesture that starts on `from`. Negative dy = upward. */
function dragVertically(from: Element, dy: number) {
  fireEvent.pointerDown(from, { button: 0, clientX: 0, clientY: 0 })
  fireEvent.pointerMove(from, { clientX: 0, clientY: dy, pointerId: 1 })
}

// A bottom sheet dismisses along the same axis its content scrolls on, so every
// downward gesture is ambiguous. Ported from vaul's `shouldDrag`: the content is
// asked first, and the panel only moves once nothing else wants the gesture.
describe("Sheet drag vs. content scroll (bottom sheet)", () => {
  it("drags when the content is already at the top", () => {
    mockSelection(true)
    const { capture, scroller } = renderBottomSheet()
    makeScrollable(scroller, { top: 0 })

    dragVertically(scroller, 40) // downward = toward dismiss

    expect(capture).toHaveBeenCalled()
  })

  it("does not drag while the content still has somewhere to scroll", () => {
    mockSelection(true)
    const { capture, scroller } = renderBottomSheet()
    makeScrollable(scroller, { top: 120 }) // scrolled down — pulling down scrolls back up

    dragVertically(scroller, 40)

    expect(capture).not.toHaveBeenCalled()
  })

  it("never drags away from the dismiss direction — that is always a scroll", () => {
    mockSelection(true)
    const { capture, scroller } = renderBottomSheet()
    makeScrollable(scroller, { top: 0 })

    dragVertically(scroller, -40) // upward on a bottom sheet = "show me more"

    expect(capture).not.toHaveBeenCalled()
  })

  it("keeps dragging locked out briefly after the content took a gesture", () => {
    // Without this, the pause between two scroll flicks reads as a fresh press
    // and the second flick dismisses the sheet mid-scroll.
    mockSelection(true)
    const { capture, scroller } = renderBottomSheet()
    makeScrollable(scroller, { top: 120 })
    dragVertically(scroller, 40) // declined → arms the lock
    expect(capture).not.toHaveBeenCalled()

    // Content is at the top now, so this gesture would otherwise be a legal drag.
    Object.defineProperty(scroller, "scrollTop", { value: 0, configurable: true })
    dragVertically(scroller, 40)

    expect(capture).not.toHaveBeenCalled()
  })

  it("honours the data-acr-no-drag opt-out", () => {
    mockSelection(true)
    const { capture, scroller } = renderBottomSheet()
    scroller.setAttribute("data-acr-no-drag", "")

    dragVertically(scroller, 40)

    expect(capture).not.toHaveBeenCalled()
  })
})

describe("Sheet drag vs. content scroll (side sheet)", () => {
  it("still drags over scrollable content — the axes are orthogonal", () => {
    // A right sheet dismisses on x while its content scrolls on y, so there is
    // nothing to arbitrate; vaul short-circuits left/right the same way.
    mockSelection(true)
    const { panel, capture } = renderOpenSheet()
    makeScrollable(panel, { top: 120 })

    const text = screen.getByText("可以选中的正文。")
    fireEvent.pointerDown(text, { button: 0, clientX: 0, clientY: 0 })
    fireEvent.pointerMove(text, { clientX: 40, clientY: 0, pointerId: 1 })

    expect(capture).toHaveBeenCalled()
  })
})
