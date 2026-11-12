import "@testing-library/jest-dom/vitest"

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
}

// jsdom ships no matchMedia, and every motion-aware component reads it on mount
// (`prefers-reduced-motion`). Default to "not reduced" so tests exercise the real
// animated/gesture path — the reduced path is the one that opts OUT of gestures,
// so defaulting to it would make gesture tests silently vacuous.
if (typeof globalThis.matchMedia === "undefined") {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof matchMedia
}

// cmdk highlights the selected item and calls scrollIntoView on it; jsdom
// (like for pointer capture) has no implementation, so stub it as a no-op.
if (typeof Element !== "undefined" && typeof Element.prototype.scrollIntoView === "undefined") {
  Element.prototype.scrollIntoView = function scrollIntoView() {}
}
