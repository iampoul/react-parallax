"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react"
import {
  ParallaxContext,
  type ParallaxContextValue,
  type ParallaxState,
} from "./parallax-context"

export interface ParallaxProps {
  /** Layers and any other content to render inside the parallax stage. */
  children: ReactNode
  /**
   * Which inputs drive the parallax effect.
   * - `"scroll"`: layers react to page scroll.
   * - `"pointer"`: layers react to cursor/touch position over the container.
   * - `"both"`: combine scroll and pointer motion. (default)
   */
  mode?: "scroll" | "pointer" | "both"
  /**
   * Global movement multiplier applied to every child layer.
   * `1` is the natural amount; `0.5` is subtle, `2` is dramatic. Default `1`.
   */
  intensity?: number
  /**
   * How smoothly layers ease toward their target position, from 0 to 1.
   * Lower = floatier/laggier, higher = snappier. `1` disables smoothing. Default `0.12`.
   */
  smoothing?: number
  /** Pause all motion. Also auto-enabled for `prefers-reduced-motion` users. Default `false`. */
  disabled?: boolean
  /** The HTML element/tag to render as the container. Default `"div"`. */
  as?: ElementType
  className?: string
  style?: CSSProperties
}

/**
 * `<Parallax>` is the stage that tracks scroll + pointer motion and broadcasts
 * it to any `<ParallaxLayer>` children. Drop one or many layers inside it.
 *
 * It uses a single requestAnimationFrame loop and a ref-based subscription
 * model, so adding more layers never triggers React re-renders.
 */
export const Parallax = forwardRef<HTMLElement, ParallaxProps>(function Parallax(
  {
    children,
    mode = "both",
    intensity = 1,
    smoothing = 0.12,
    disabled = false,
    as,
    className,
    style,
  },
  forwardedRef,
) {
  const Tag = (as ?? "div") as ElementType
  const containerRef = useRef<HTMLElement | null>(null)
  const subscribers = useRef(new Set<(s: ParallaxState) => void>())

  // The smoothed/animated state that is broadcast to layers.
  const state = useRef<ParallaxState>({ scrollProgress: 0.5, pointerX: 0, pointerY: 0 })
  // The raw target values updated by scroll/pointer events.
  const target = useRef<ParallaxState>({ scrollProgress: 0.5, pointerX: 0, pointerY: 0 })

  const prefersReduced = useRef(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    prefersReduced.current = mq.matches
    const onChange = () => (prefersReduced.current = mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      containerRef.current = node
      if (typeof forwardedRef === "function") forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [forwardedRef],
  )

  // Read scroll progress relative to the viewport.
  const measureScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    // Progress from 0 (entering at bottom) to 1 (leaving at top).
    const raw = (vh - rect.top) / (vh + rect.height)
    target.current.scrollProgress = Math.min(1, Math.max(0, raw))
  }, [])

  const onPointer = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (clientX - rect.left) / rect.width
    const py = (clientY - rect.top) / rect.height
    target.current.pointerX = Math.min(1, Math.max(-1, px * 2 - 1))
    target.current.pointerY = Math.min(1, Math.max(-1, py * 2 - 1))
  }, [])

  const isInactive = disabled

  useEffect(() => {
    const useScroll = mode === "scroll" || mode === "both"
    const usePointer = mode === "pointer" || mode === "both"
    const el = containerRef.current

    const handleScroll = () => measureScroll()
    const handleResize = () => measureScroll()
    const handleMouse = (e: MouseEvent) => onPointer(e.clientX, e.clientY)
    const handleTouch = (e: TouchEvent) => {
      if (e.touches[0]) onPointer(e.touches[0].clientX, e.touches[0].clientY)
    }
    const handlePointerLeave = () => {
      target.current.pointerX = 0
      target.current.pointerY = 0
    }

    measureScroll()

    if (useScroll) {
      window.addEventListener("scroll", handleScroll, { passive: true })
      window.addEventListener("resize", handleResize)
    }
    if (usePointer && el) {
      el.addEventListener("mousemove", handleMouse)
      el.addEventListener("touchmove", handleTouch, { passive: true })
      el.addEventListener("mouseleave", handlePointerLeave)
      el.addEventListener("touchend", handlePointerLeave)
    }

    let raf = 0
    const tick = () => {
      const ease = isInactive ? 1 : Math.min(1, Math.max(0.01, smoothing))
      const s = state.current
      const t = isInactive
        ? { scrollProgress: 0.5, pointerX: 0, pointerY: 0 }
        : target.current

      s.scrollProgress += (t.scrollProgress - s.scrollProgress) * ease
      s.pointerX += (t.pointerX - s.pointerX) * ease
      s.pointerY += (t.pointerY - s.pointerY) * ease

      subscribers.current.forEach((cb) => cb(s))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      if (useScroll) {
        window.removeEventListener("scroll", handleScroll)
        window.removeEventListener("resize", handleResize)
      }
      if (usePointer && el) {
        el.removeEventListener("mousemove", handleMouse)
        el.removeEventListener("touchmove", handleTouch)
        el.removeEventListener("mouseleave", handlePointerLeave)
        el.removeEventListener("touchend", handlePointerLeave)
      }
    }
  }, [mode, smoothing, isInactive, measureScroll, onPointer])

  const ctxValue = useMemo<ParallaxContextValue>(
    () => ({
      intensity,
      disabled: disabled || prefersReduced.current,
      mode,
      getState: () => state.current,
      subscribe: (cb) => {
        subscribers.current.add(cb)
        cb(state.current)
        return () => subscribers.current.delete(cb)
      },
    }),
    [intensity, disabled, mode],
  )

  const containerStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    ...style,
  }

  return (
    <ParallaxContext.Provider value={ctxValue}>
      <Tag
        ref={setRefs}
        data-parallax-container=""
        className={className}
        style={containerStyle}
      >
        {children}
      </Tag>
    </ParallaxContext.Provider>
  )
})
