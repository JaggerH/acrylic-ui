import * as React from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Sheet, SheetContent, SheetTitle } from "./sheet"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

/** Committing a drag is observable exactly here — it is the call that grabs the
 *  pointer, and jsdom has no pointer capture of its own to get in the way. */
function renderSheet(side: "right" | "bottom") {
  render(
    <Sheet open>
      <SheetContent side={side}>
        <SheetTitle>标题</SheetTitle>
        <div data-testid="body">
          <p>可以选中的正文。</p>
        </div>
      </SheetContent>
    </Sheet>
  )
  const panel = document.querySelector('[data-slot="sheet-content"]')
  if (!panel) throw new Error("expected the sheet panel to be in the document")
  const capture = vi.fn()
  ;(panel as HTMLElement & { setPointerCapture: unknown }).setPointerCapture = capture
  return { panel, capture, body: screen.getByTestId("body") }
}

/** One gesture: press on `from`, then move past DRAG_THRESHOLD (5px). */
function drag(
  from: Element,
  { dx = 0, dy = 0, pointerType = "touch" }: { dx?: number; dy?: number; pointerType?: string }
) {
  fireEvent.pointerDown(from, { button: 0, clientX: 0, clientY: 0, pointerType })
  fireEvent.pointerMove(from, { clientX: dx, clientY: dy, pointerId: 1 })
}

/** jsdom reports 0 for every scroll metric, so a scroller has to be declared. */
function makeScrollable(el: Element, { top }: { top: number }) {
  Object.defineProperty(el, "scrollHeight", { value: 1000, configurable: true })
  Object.defineProperty(el, "clientHeight", { value: 400, configurable: true })
  Object.defineProperty(el, "scrollTop", { value: top, writable: true, configurable: true })
}

// The panel is draggable by finger only. With a cursor, press-and-move already
// belongs to the browser (select text, scroll), and taking it produced a sheet
// that slid away while the user was trying to highlight a sentence. Arbitration
// could not fix that reliably: at the 5px mark where a drag must commit, the
// selection has not formed yet, and committing calls setPointerCapture, which
// kills it for good. So the cursor keeps its gestures and closes via ✕ / Esc.
describe("Sheet drag is a touch affordance", () => {
  it.each(["mouse", "pen", ""])("ignores a %s press entirely", (pointerType) => {
    const { capture, body } = renderSheet("right")

    drag(body, { dx: 60, pointerType })

    expect(capture).not.toHaveBeenCalled()
  })

  it("drags on touch", () => {
    const { capture, body } = renderSheet("right")

    drag(body, { dx: 60 })

    expect(capture).toHaveBeenCalled()
  })

  it("ignores movement below the drag threshold", () => {
    const { capture, body } = renderSheet("right")

    drag(body, { dx: 3 })

    expect(capture).not.toHaveBeenCalled()
  })

  it("is not blocked by a selection left over from an earlier mouse gesture", () => {
    // Regression guard with teeth: an earlier version asked `getSelection()` here.
    // Touch never creates a selection, so the only thing that check could ever see
    // was a stale desktop one — and it would refuse to drag the sheet on a phone
    // because of a highlight made minutes earlier.
    vi.spyOn(window, "getSelection").mockReturnValue({ isCollapsed: false } as unknown as Selection)
    const { capture, body } = renderSheet("right")

    drag(body, { dx: 60 })

    expect(capture).toHaveBeenCalled()
  })
})

// A bottom sheet dismisses along the same axis its content scrolls on, so every
// downward flick is ambiguous. Ported from vaul's `shouldDrag`: the content is
// asked first, and the panel only moves once nothing else wants the gesture.
describe("Sheet drag vs. content scroll (bottom sheet)", () => {
  it("drags when the content is already at the top", () => {
    const { capture, body } = renderSheet("bottom")
    makeScrollable(body, { top: 0 })

    drag(body, { dy: 40 }) // downward = toward dismiss

    expect(capture).toHaveBeenCalled()
  })

  it("does not drag while the content still has somewhere to scroll", () => {
    const { capture, body } = renderSheet("bottom")
    makeScrollable(body, { top: 120 }) // pulling down scrolls back up first

    drag(body, { dy: 40 })

    expect(capture).not.toHaveBeenCalled()
  })

  it("never drags away from the dismiss direction — that is always a scroll", () => {
    const { capture, body } = renderSheet("bottom")
    makeScrollable(body, { top: 0 })

    drag(body, { dy: -40 }) // upward on a bottom sheet = "show me more"

    expect(capture).not.toHaveBeenCalled()
  })

  it("keeps dragging locked out briefly after the content took a gesture", () => {
    // Without this, the pause between two scroll flicks reads as a fresh press
    // and the second flick dismisses the sheet mid-scroll.
    const { capture, body } = renderSheet("bottom")
    makeScrollable(body, { top: 120 })
    drag(body, { dy: 40 }) // declined → arms the lock
    expect(capture).not.toHaveBeenCalled()

    Object.defineProperty(body, "scrollTop", { value: 0, configurable: true })
    drag(body, { dy: 40 }) // would be legal now, but the lock is still warm

    expect(capture).not.toHaveBeenCalled()
  })

  it("honours the data-acr-no-drag opt-out", () => {
    const { capture, body } = renderSheet("bottom")
    body.setAttribute("data-acr-no-drag", "")

    drag(body, { dy: 40 })

    expect(capture).not.toHaveBeenCalled()
  })
})

describe("Sheet drag vs. content scroll (side sheet)", () => {
  it("drags over scrollable content — the axes are orthogonal", () => {
    // A right sheet dismisses on x while its content scrolls on y, so there is
    // nothing to arbitrate; vaul short-circuits left/right the same way.
    const { capture, body } = renderSheet("right")
    makeScrollable(body, { top: 120 })

    drag(body, { dx: 60 })

    expect(capture).toHaveBeenCalled()
  })
})
