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
      <ParallaxLayer data-testid="layer" {...layerProps} />
    </Parallax>,
  )
}

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
    expect(container.firstChild).toHaveAttribute("data-parallax-container")
  })

  it("applies overflow hidden by default", () => {
    const { container } = render(<Parallax><div /></Parallax>)
    expect(container.firstChild).toHaveStyle({ overflow: "hidden" })
  })

  it("applies custom overflow prop", () => {
    const { container } = render(<Parallax overflow="visible"><div /></Parallax>)
    expect(container.firstChild).toHaveStyle({ overflow: "visible" })
  })

  it("renders as a custom element when as prop is set", () => {
    render(<Parallax as="section" data-testid="stage"><div /></Parallax>)
    expect(screen.getByTestId("stage").tagName).toBe("SECTION")
  })

  it("throws if useParallax is used outside <Parallax>", () => {
    function Bad() {
      useParallax()
      return null
    }
    // suppress React error boundary noise
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<Bad />)).toThrow(
      "<ParallaxLayer> must be rendered inside a <Parallax> container.",
    )
    spy.mockRestore()
  })
})

describe("<ParallaxLayer>", () => {
  it("renders with data-parallax-layer attribute", () => {
    const { getByTestId } = renderParallax({}, { "data-testid": "layer" })
    expect(getByTestId("layer")).toHaveAttribute("data-parallax-layer")
  })

  it("applies will-change: transform by default", () => {
    const { getByTestId } = renderParallax({}, { "data-testid": "layer" })
    expect(getByTestId("layer")).toHaveStyle({ willChange: "transform" })
  })

  it("applies will-change: transform, filter when blur is set", () => {
    const { getByTestId } = renderParallax({}, { "data-testid": "layer", blur: 4 })
    expect(getByTestId("layer")).toHaveStyle({ willChange: "transform, filter" })
  })

  it("applies will-change: transform, filter when blurBase is set", () => {
    const { getByTestId } = renderParallax({}, { "data-testid": "layer", blurBase: 4 })
    expect(getByTestId("layer")).toHaveStyle({ willChange: "transform, filter" })
  })

  it("resets transform and clears filter when disabled", () => {
    const { getByTestId } = render(
      <Parallax disabled>
        <ParallaxLayer data-testid="layer" blur={4} />
      </Parallax>,
    )
    act(() => flushRaf())
    const el = getByTestId("layer")
    expect(el.style.transform).toBe("translate3d(0,0,0)")
    expect(el.style.opacity).toBe("1")
    expect(el.style.filter).toBe("")
  })

  it("renders as a custom element when as prop is set", () => {
    render(
      <Parallax>
        <ParallaxLayer as="span" data-testid="layer" />
      </Parallax>,
    )
    expect(screen.getByTestId("layer").tagName).toBe("SPAN")
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

    const { getByTestId } = render(
      <Parallax>
        <ParallaxLayer data-testid="layer" />
      </Parallax>,
    )
    act(() => flushRaf())
    expect(getByTestId("layer").style.transform).toBe("translate3d(0,0,0)")
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
