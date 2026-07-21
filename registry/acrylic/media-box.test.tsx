import * as React from "react"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { MediaBox, computeMediaBox } from "./media-box"

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function getImg() {
  const img = document.querySelector("img")
  if (!img) throw new Error("expected an <img> to be in the document")
  return img
}

function queryImg() {
  return document.querySelector("img")
}

// Retry/fallback now lives in CardMedia; MediaBox forwards src/fallback/maxRetries/
// retryDelayMs to it, so this behavior is exercised through the composition.
describe("MediaBox error retry (delegated to CardMedia)", () => {
  it("does not show the fallback on the first load error — it waits to retry", () => {
    render(<MediaBox src="https://example.com/a.jpg" maxRetries={2} retryDelayMs={100} />)

    fireEvent.error(getImg())

    expect(queryImg()).not.toBeInTheDocument()
    expect(document.querySelector("svg")).not.toBeInTheDocument()
  })

  it("remounts a fresh <img> after the backoff delay", () => {
    vi.useFakeTimers()
    render(<MediaBox src="https://example.com/a.jpg" maxRetries={2} retryDelayMs={100} />)

    fireEvent.error(getImg())
    expect(queryImg()).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(getImg()).toBeInTheDocument()
  })

  it("backs off exponentially between attempts", () => {
    vi.useFakeTimers()
    render(<MediaBox src="https://example.com/a.jpg" maxRetries={3} retryDelayMs={100} />)

    fireEvent.error(getImg()) // attempt 0 failed, delay = 100 * 2^0 = 100
    act(() => {
      vi.advanceTimersByTime(99)
    })
    expect(queryImg()).not.toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(getImg()).toBeInTheDocument()

    fireEvent.error(getImg()) // attempt 1 failed, delay = 100 * 2^1 = 200
    act(() => {
      vi.advanceTimersByTime(199)
    })
    expect(queryImg()).not.toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(getImg()).toBeInTheDocument()
  })

  it("falls back to the ImageOff placeholder once retries are exhausted", () => {
    vi.useFakeTimers()
    render(<MediaBox src="https://example.com/a.jpg" maxRetries={1} retryDelayMs={50} />)

    fireEvent.error(getImg()) // attempt 0 -> retry scheduled
    act(() => {
      vi.advanceTimersByTime(50)
    })
    fireEvent.error(getImg()) // attempt 1 -> retries exhausted, give up

    expect(queryImg()).not.toBeInTheDocument()
    expect(document.querySelector("svg")).toBeInTheDocument()
  })

  it("renders a custom fallback node once exhausted", () => {
    render(
      <MediaBox
        src="https://example.com/a.jpg"
        maxRetries={0}
        retryDelayMs={50}
        fallback={<span>broken</span>}
      />
    )

    fireEvent.error(getImg())

    expect(screen.getByText("broken")).toBeInTheDocument()
  })

  it("maxRetries=0 fails immediately, matching the pre-retry behavior", () => {
    render(<MediaBox src="https://example.com/a.jpg" maxRetries={0} retryDelayMs={50} />)

    fireEvent.error(getImg())

    expect(queryImg()).not.toBeInTheDocument()
    expect(document.querySelector("svg")).toBeInTheDocument()
  })

  it("a successful load resets the retry count for the next failure", () => {
    vi.useFakeTimers()
    render(<MediaBox src="https://example.com/a.jpg" maxRetries={1} retryDelayMs={100} />)

    fireEvent.error(getImg()) // attempt 0 -> retry scheduled
    act(() => {
      vi.advanceTimersByTime(100)
    })
    fireEvent.load(getImg()) // recovers cleanly

    fireEvent.error(getImg()) // should get a fresh retry budget, not treated as exhausted
    expect(queryImg()).not.toBeInTheDocument()
    expect(document.querySelector("svg")).not.toBeInTheDocument()
  })

  it("changing src cancels a pending retry and resets to a clean attempt", () => {
    vi.useFakeTimers()
    const { rerender } = render(
      <MediaBox src="https://example.com/a.jpg" maxRetries={0} retryDelayMs={100} />
    )

    fireEvent.error(getImg())
    expect(document.querySelector("svg")).toBeInTheDocument()

    rerender(<MediaBox src="https://example.com/b.jpg" maxRetries={0} retryDelayMs={100} />)

    expect(getImg()).toHaveAttribute("src", "https://example.com/b.jpg")
    expect(document.querySelector("svg")).not.toBeInTheDocument()
  })

  it("clears the pending retry timer on unmount", () => {
    vi.useFakeTimers()
    const { unmount } = render(
      <MediaBox src="https://example.com/a.jpg" maxRetries={2} retryDelayMs={100} />
    )

    fireEvent.error(getImg())
    unmount()

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(1000)
      })
    }).not.toThrow()
  })
})

describe("MediaBox natural-ratio frame", () => {
  it("sizes the frame to the media's natural aspect ratio (no letterbox box)", () => {
    render(<MediaBox src="https://example.com/a.jpg" naturalWidth={1600} naturalHeight={900} />)
    const frame = document.querySelector('[data-slot="media-box-frame"]') as HTMLElement
    expect(frame).toBeTruthy()
    expect(frame.style.aspectRatio).toBe("1600 / 900")
  })

  it("holds a neutral wide ratio before the media's size is known", () => {
    render(<MediaBox src="https://example.com/a.jpg" />)
    const frame = document.querySelector('[data-slot="media-box-frame"]') as HTMLElement
    expect(frame.style.aspectRatio).toBe("16 / 9")
  })
})

describe("computeMediaBox", () => {
  it("fills the container width at the media's natural ratio", () => {
    const box = computeMediaBox({ naturalWidth: 1600, naturalHeight: 900, containerWidth: 1000 })
    expect(box.width).toBe(1000)
    expect(box.height).toBe(563) // 1000 / (16/9)
    expect(box.ratio).toBeCloseTo(16 / 9, 5)
  })

  it("caps width at maxWidth", () => {
    const box = computeMediaBox({ naturalWidth: 1600, naturalHeight: 900, containerWidth: 1000, maxWidth: 520 })
    expect(box.width).toBe(520)
  })

  it("reduces width so height respects maxHeight (maxHeight × ratio)", () => {
    const box = computeMediaBox({ naturalWidth: 1600, naturalHeight: 900, containerWidth: 1000, maxHeight: 300 })
    expect(box.height).toBe(300)
    expect(box.width).toBe(533) // 300 * (16/9)
  })

  it("lets minWidth win over maxHeight on a tall portrait (frame may exceed maxHeight)", () => {
    const box = computeMediaBox({
      naturalWidth: 720,
      naturalHeight: 960,
      containerWidth: 1000,
      maxHeight: 200,
      minWidth: 300,
    })
    expect(box.width).toBe(300) // floor wins; without it width would be 150 (200 * 0.75)
    expect(box.height).toBe(400) // 300 / 0.75 — exceeds maxHeight, by design
  })

  it("falls back to a wide ratio when natural dims are unknown", () => {
    const box = computeMediaBox({ naturalWidth: 0, naturalHeight: 0, containerWidth: 800 })
    expect(box.ratio).toBeCloseTo(16 / 9, 5)
    expect(box.width).toBe(800)
    expect(box.height).toBe(450)
  })

  it("is zero-sized with no container and no minWidth floor", () => {
    const box = computeMediaBox({ naturalWidth: 1600, naturalHeight: 900, containerWidth: 0 })
    expect(box.width).toBe(0)
    expect(box.height).toBe(0)
  })
})

// videoMaxHeight needs a real container width to bite, so stub ResizeObserver to report one.
class ResizeObserverStub {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe(target: Element) {
    Object.defineProperty(target, "clientWidth", { value: 490, configurable: true })
    this.callback([{ contentRect: { width: 490 } } as ResizeObserverEntry], this as unknown as ResizeObserver)
  }
  disconnect() {}
}

describe("MediaBox videoMaxHeight", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function frame() {
    return document.querySelector('[data-slot="media-box-frame"]') as HTMLElement
  }

  it("caps a portrait video tighter than maxHeight, keeping the natural ratio (no letterbox)", () => {
    // 720x1280 (9:16), container 490, maxHeight 920 but videoMaxHeight 507 wins:
    // cap 507 -> width = 507 * (720/1280) = 285, height derived from aspect-ratio.
    render(<MediaBox kind="video" src="/v.jpg" naturalWidth={720} naturalHeight={1280} maxHeight={920} videoMaxHeight={507} />)
    expect(frame().style.width).toBe("285px")
    expect(frame().style.aspectRatio).toBe("720 / 1280")
  })

  it("does not apply videoMaxHeight to images", () => {
    // same dims as image: ignores videoMaxHeight, uses maxHeight 920 -> width min(490, 920*0.5625=517) = 490.
    render(<MediaBox kind="image" src="/i.jpg" naturalWidth={720} naturalHeight={1280} maxHeight={920} videoMaxHeight={507} />)
    expect(frame().style.width).toBe("490px")
  })
})
