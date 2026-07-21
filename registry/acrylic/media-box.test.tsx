import * as React from "react"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { MediaBox } from "./media-box"

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

describe("MediaBox error retry", () => {
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
    vi.useFakeTimers()
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
