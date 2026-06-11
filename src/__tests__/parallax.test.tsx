import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import React from "react"
import { Parallax } from "../parallax"
import { ParallaxLayer } from "../parallax-layer"
import { useParallax } from "../parallax-context"
import { flushRaf } from "./setup"

// Helper: render a Parallax with one layer and flush one rAF tick
function renderParallax(props = {}, layerProps = {}) {
  return render(
    <Parallax {...props}>
      <ParallaxLayer {...layerProps} />
    </Parallax>,
  )
}

/** Get the first [data-parallax-container] from a rendered result */
const getContainer = (c: HTMLElement) =>
  c.querySelector("[data-parallax-container]") as HTMLElement

/** Get the first [data-parallax-layer] from a rendered result */
const getLayer = (c: HTMLElement) =>
  c.querySelector("[data-parallax-layer]") as HTMLElement

describe("<Parallax>", () => {
  it("renders its children", () => {
    render(
      <Parallax>
        <span data-testid="child">hello</span>
      </Parallax>,
    )
    expect(screen.getByTestId("child")).toBeInTheDocument()
  })

  it("renders with data-parallax-container attribute", () => {
    const { container } = render(<Parallax><div /></Parallax>)
    expect(getContainer(container)).toBeInTheDocument()
  })

  it("applies overflow hidden by default", () => {
    const { container } = render(<Parallax><div /></Parallax>)
    expect(getContainer(container)).toHaveStyle({ overflow: "hidden" })
  })

  it("applies custom overflow prop", () => {
    const { container } = render(<Parallax overflow="visible"><div /></Parallax>)
    expect(getContainer(container)).toHaveStyle({ overflow: "visible" })
  })

  it("renders as a custom element when as prop is set", () => {
    const { container } = render(<Parallax as="section"><div /></Parallax>)
    expect(getContainer(container)?.tagName).toBe("SECTION")
  })

  it("throws if useParallax is used outside <Parallax>", () => {
    function Bad() {
      useParallax()
      return null
    }
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<Bad />)).toThrow(
      "<ParallaxLayer> must be rendered inside a <Parallax> container.",
    )
    spy.mockRestore()
  })
})

describe("<ParallaxLayer>", () => {
  it("renders with data-parallax-layer attribute", () => {
    const { container } = renderParallax()
    expect(getLayer(container)).toBeInTheDocument()
  })

  it("applies will-change: transform by default", () => {
    const { container } = renderParallax()
    expect(getLayer(container)).toHaveStyle({ willChange: "transform" })
  })

  it("applies will-change: transform, filter when blur is set", () => {
    const { container } = renderParallax({}, { blur: 4 })
    expect(getLayer(container)).toHaveStyle({ willChange: "transform, filter" })
  })

  it("applies will-change: transform, filter when blurBase is set", () => {
    const { container } = renderParallax({}, { blurBase: 4 })
    expect(getLayer(container)).toHaveStyle({ willChange: "transform, filter" })
  })

  it("resets transform and clears filter when disabled", () => {
    const { container } = render(
      <Parallax disabled>
        <ParallaxLayer blur={4} />
      </Parallax>,
    )
    act(() => flushRaf())
    const el = getLayer(container)
    expect(el.style.transform).toBe("translate3d(0,0,0)")
    expect(el.style.opacity).toBe("1")
    expect(el.style.filter).toBe("")
  })

  it("renders as a custom element when as prop is set", () => {
    const { container } = render(
      <Parallax>
        <ParallaxLayer as="span" />
      </Parallax>,
    )
    expect(getLayer(container)?.tagName).toBe("SPAN")
  })
})

describe("prefers-reduced-motion", () => {
  it("disables motion when prefers-reduced-motion is active on mount", () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { container } = render(
      <Parallax>
        <ParallaxLayer />
      </Parallax>,
    )
    act(() => flushRaf())
    expect(getLayer(container).style.transform).toBe("translate3d(0,0,0)")
  })

  beforeEach(() => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })
})

describe("onProgress callback", () => {
  it("fires onProgress on each rAF tick", () => {
    const onProgress = vi.fn()
    render(
      <Parallax onProgress={onProgress}>
        <div />
      </Parallax>,
    )
    act(() => flushRaf())
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        scrollProgress: expect.any(Number),
        pointerX: expect.any(Number),
        pointerY: expect.any(Number),
      }),
    )
  })
})

describe("scrollRange", () => {
  it("accepts a number scrollRange without throwing", () => {
    expect(() => renderParallax({}, { scrollRange: 200 })).not.toThrow()
  })

  it("accepts a percentage string scrollRange without throwing", () => {
    expect(() => renderParallax({}, { scrollRange: "25%" })).not.toThrow()
  })
})
