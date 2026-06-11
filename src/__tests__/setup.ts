import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"

// Mock requestAnimationFrame / cancelAnimationFrame
let rafId = 0
const rafCallbacks = new Map<number, FrameRequestCallback>()

vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
  const id = ++rafId
  rafCallbacks.set(id, cb)
  return id
})

vi.stubGlobal("cancelAnimationFrame", (id: number) => {
  rafCallbacks.delete(id)
})

/** Flush all pending rAF callbacks once. */
export function flushRaf() {
  const cbs = Array.from(rafCallbacks.entries())
  rafCallbacks.clear()
  cbs.forEach(([, cb]) => cb(performance.now()))
}

// Mock IntersectionObserver — jsdom doesn't implement it.
// Immediately fires the callback with isIntersecting: true so the rAF loop starts.
class IntersectionObserverMock {
  constructor(cb: IntersectionObserverCallback) {
    cb([{ isIntersecting: true } as IntersectionObserverEntry], this)
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
vi.stubGlobal("IntersectionObserver", IntersectionObserverMock)

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
