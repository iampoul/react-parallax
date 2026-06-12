"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react"
import { useParallax, type ParallaxState } from "./parallax-context"

export interface ParallaxLayerProps {
  children?: ReactNode
  /**
   * Depth of the layer. The core "vital" parallax prop.
   * - `0`  = locked to the page (no scroll movement).
   * - `>0` = moves slower than scroll, appears further away (background).
   * - `<0` = moves faster than scroll, appears closer (foreground).
   * Typical range: `-1` to `1`. Default `0.3`.
   */
  speed?: number
  /**
   * How strongly this layer reacts to pointer movement, in pixels of travel.
   * `0` disables pointer response for this layer. Default `0`.
   */
  pointerStrength?: number
  /**
   * Max travel distance for scroll-driven movement.
   * - Pass a `number` for absolute pixels (e.g. `120`). Default `120`.
   * - Pass a `string` percentage (e.g. `"25%"`) to derive the range from the
   *   container's current height — keeps motion proportional across screen sizes.
   */
  scrollRange?: number | string
  /** Axis (or axes) the scroll parallax moves along. Default `"y"`. */
  axis?: "x" | "y" | "both"
  /** Degrees of rotation applied across the scroll range. Default `0`. */
  rotate?: number
  /** Extra scale added at the end of the scroll range (e.g. `0.2` = +20%). Default `0`. */
  scale?: number
  /** Opacity at the start of travel, easing to `1` at center. `1` disables fade. Default `1`. */
  fade?: number
  /**
   * Maximum blur in pixels applied to this layer, creating a depth-of-field camera focus effect.
   * Blur is `0px` when the container is centered in the viewport (in focus) and increases to
   * `blur`px toward the scroll edges (out of focus). `0` disables blur. Default `0`.
   *
   * @example
   * // Background layer, sharpens as it enters view
   * <ParallaxLayer speed={0.5} blur={4} />
   */
  blur?: number
  /**
   * A constant blur in pixels always applied to this layer, regardless of scroll position.
   * Use this for layers that should always appear out of focus — e.g. a soft background behind
   * a sharp focal element. Composes with `blur`: total blur = `blurBase + abs(scrollEdge) * blur`.
   *
   * @example
   * // Always blurred background layer
   * <ParallaxLayer speed={0.5} blurBase={6} />
   * // Always blurred, gets even softer at edges
   * <ParallaxLayer speed={0.5} blurBase={3} blur={3} />
   */
  blurBase?: number
  /** Stacking order within the container. Default `0`. */
  zIndex?: number
  /** Render as a specific tag/element. Default `"div"`. */
  as?: ElementType
  className?: string
  style?: CSSProperties
}

/**
 * `<ParallaxLayer>` is a single moving object inside a `<Parallax>` container.
 * Use as many as you like, each with its own `speed`, `pointerStrength`,
 * `rotate`, `scale`, `fade`, and `blur` to compose layered depth.
 */
export const ParallaxLayer = forwardRef<HTMLElement, ParallaxLayerProps>(
  function ParallaxLayer(
    {
      children,
      speed = 0.3,
      pointerStrength = 0,
      scrollRange = 120,
      axis = "y",
      rotate = 0,
      scale = 0,
      fade = 1,
      blur = 0,
      blurBase = 0,
      zIndex = 0,
      as,
      className,
      style,
    },
    forwardedRef,
  ) {
    const Tag = (as ?? "div") as ElementType
    const { subscribe, intensity, disabled, containerRef, direction } = useParallax()
    const elRef = useRef<HTMLElement | null>(null)

    const setRefs = useCallback(
      (node: HTMLElement | null) => {
        elRef.current = node
        if (typeof forwardedRef === "function") forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [forwardedRef],
    )

    const apply = useCallback(
      (s: ParallaxState) => {
        const el = elRef.current
        if (!el) return

        if (disabled) {
          el.style.transform = "translate3d(0,0,0)"
          el.style.opacity = "1"
          el.style.filter = ""
          return
        }

        // Center the scroll progress around 0: -0.5 (top) .. 0.5 (bottom).
        const p = (s.scrollProgress - 0.5) * 2 // -1 .. 1

        // Resolve scrollRange: absolute px or percentage of the <Parallax> container dimension.
        // When direction is "horizontal", % resolves against container width; otherwise height.
        const containerSize = direction === "horizontal"
          ? (containerRef.current?.offsetWidth ?? 0)
          : (containerRef.current?.offsetHeight ?? 0)
        const resolvedRange =
          typeof scrollRange === "string" && scrollRange.endsWith("%")
            ? (parseFloat(scrollRange) / 100) * containerSize
            : (scrollRange as number)

        const travel = p * resolvedRange * speed * intensity

        const scrollX = axis === "x" || axis === "both" ? travel : 0
        const scrollY = axis === "y" || axis === "both" ? travel : 0

        const ptrX = s.pointerX * pointerStrength * intensity
        const ptrY = s.pointerY * pointerStrength * intensity

        const tx = scrollX + ptrX
        const ty = scrollY + ptrY

        const rot = rotate ? p * rotate : 0
        const scl = scale ? 1 + Math.abs(p) * scale : 1

        el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(
          2,
        )}px, 0) rotate(${rot.toFixed(2)}deg) scale(${scl.toFixed(3)})`

        if (fade < 1) {
          const opacity = fade + (1 - fade) * (1 - Math.min(1, Math.abs(p)))
          el.style.opacity = opacity.toFixed(3)
        }

        if (blur > 0 || blurBase > 0) {
          const blurPx = blurBase + Math.abs(p) * blur
          el.style.filter = `blur(${blurPx.toFixed(2)}px)`
        }
      },
      [speed, pointerStrength, scrollRange, axis, rotate, scale, fade, blur, blurBase, intensity, disabled, direction],
    )

    useEffect(() => subscribe(apply), [subscribe, apply])

    const layerStyle: CSSProperties = {
      willChange: (blur > 0 || blurBase > 0) ? "transform, filter" : "transform",
      zIndex,
      ...style,
    }

    return (
      <Tag
        ref={setRefs}
        data-parallax-layer=""
        className={className}
        style={layerStyle}
      >
        {children}
      </Tag>
    )
  },
)
