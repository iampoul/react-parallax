"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
   * Ignored when `springConfig` is set.
   */
  smoothing?: number
  /**
   * Spring physics config as an alternative to the lerp `smoothing`.
   * When provided, `smoothing` is ignored and motion is governed by spring dynamics
   * — giving a more natural, physical feel especially for pointer-driven effects.
   *
   * - `stiffness`: how strongly the spring pulls toward the target (default `120`)
   * - `damping`: resistance that prevents oscillation (default `14`)
   *
   * @example
   * <Parallax springConfig={{ stiffness: 80, damping: 10 }} />  // loose, bouncy
   * <Parallax springConfig={{ stiffness: 200, damping: 20 }} /> // tight, snappy
   */
  springConfig?: { stiffness?: number; damping?: number }
  /** Pause all motion. Also auto-enabled for `prefers-reduced-motion` users. Default `false`. */
  disabled?: boolean
  /**
   * Custom scroll container. Defaults to `window`. Pass this when `<Parallax>`
   * lives inside a scrollable element (modal, sidebar, overflow div, etc.).
   */
  scrollParent?: HTMLElement | null
  /**
   * CSS overflow applied to the container. Default `"hidden"`. Set to `"visible"`
   * if layers should bleed outside the container bounds.
   */
  overflow?: CSSProperties["overflow"]
  /**
   * Callback fired on every animation frame with the current smoothed motion state.
   * Use this to drive external animations or read scroll/pointer progress without
   * needing the `useParallax()` hook.
   *
   * @example
   * <Parallax onProgress={({ scrollProgress }) => setOpacity(scrollProgress)} />
   */
  onProgress?: (state: ParallaxState) => void
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
    scrollParent,
    overflow = "hidden",
    onProgress,
    springConfig,
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

  // Keep onProgress in a ref so the rAF tick always calls the latest version
  // without needing to restart the loop when the prop changes.
  const onProgressRef = useRef(onProgress)
  useEffect(() => { onProgressRef.current = onProgress }, [onProgress])

  // Keep springConfig in a ref for the same reason — inline object literals would
  // otherwise restart the rAF loop on every parent render.
  const springConfigRef = useRef(springConfig)
  useEffect(() => { springConfigRef.current = springConfig }, [springConfig])

  // Velocity state for spring physics — one value per axis.
  const velocity = useRef({ scrollProgress: 0, pointerX: 0, pointerY: 0 })

  // useState (not useRef) so OS-level motion preference changes re-trigger context updates.
  // Initialised in useEffect to avoid SSR mismatch.
  const [prefersReduced, setPrefersReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReduced(mq.matches)
    const onChange = () => setPrefersReduced(mq.matches)
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

  const isInactive = disabled || prefersReduced

  useEffect(() => {
    const useScroll = mode === "scroll" || mode === "both"
    const usePointer = mode === "pointer" || mode === "both"
    const el = containerRef.current
    // Attach scroll listener to custom parent or window.
    const scrollEl = scrollParent ?? window

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
      scrollEl.addEventListener("scroll", handleScroll, { passive: true })
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
      const s = state.current
      const t = isInactive
        ? { scrollProgress: 0.5, pointerX: 0, pointerY: 0 }
        : target.current

      if (springConfigRef.current) {
        // Spring physics: F = stiffness * displacement - damping * velocity
        const k = (springConfigRef.current.stiffness ?? 120) / 1000
        const b = (springConfigRef.current.damping ?? 14) / 1000
        const v = velocity.current
        const axes = ["scrollProgress", "pointerX", "pointerY"] as const
        for (const axis of axes) {
          const displacement = t[axis] - s[axis]
          v[axis] += displacement * k - v[axis] * b
          s[axis] += v[axis]
        }
      } else {
        // Lerp smoothing
        const ease = isInactive ? 1 : Math.min(1, Math.max(0.01, smoothing))
        s.scrollProgress += (t.scrollProgress - s.scrollProgress) * ease
        s.pointerX += (t.pointerX - s.pointerX) * ease
        s.pointerY += (t.pointerY - s.pointerY) * ease
      }

      subscribers.current.forEach((cb) => cb(s))
      onProgressRef.current?.(s)
      raf = requestAnimationFrame(tick)
    }

    const startLoop = () => {
      if (raf === 0) {
        measureScroll()
        raf = requestAnimationFrame(tick)
      }
    }

    const stopLoop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    // Pause when tab is hidden; resume when visible again.
    const handleVisibility = () => {
      document.hidden ? stopLoop() : startLoop()
    }

    // Pause when the container scrolls fully out of the viewport; resume when it re-enters.
    // threshold:0 fires as soon as any pixel enters or leaves.
    const io = new IntersectionObserver(
      ([entry]) => { entry.isIntersecting ? startLoop() : stopLoop() },
      { threshold: 0 },
    )
    if (el) io.observe(el)

    document.addEventListener("visibilitychange", handleVisibility)
    startLoop()

    return () => {
      stopLoop()
      io.disconnect()
      document.removeEventListener("visibilitychange", handleVisibility)
      if (useScroll) {
        scrollEl.removeEventListener("scroll", handleScroll)
        window.removeEventListener("resize", handleResize)
      }
      if (usePointer && el) {
        el.removeEventListener("mousemove", handleMouse)
        el.removeEventListener("touchmove", handleTouch)
        el.removeEventListener("mouseleave", handlePointerLeave)
        el.removeEventListener("touchend", handlePointerLeave)
      }
    }
  }, [mode, smoothing, isInactive, measureScroll, onPointer, scrollParent])

  const ctxValue = useMemo<ParallaxContextValue>(
    () => ({
      intensity,
      disabled: disabled || prefersReduced,
      mode,
      containerRef,
      getState: () => state.current,
      subscribe: (cb) => {
        subscribers.current.add(cb)
        cb(state.current)
        return () => subscribers.current.delete(cb)
      },
    }),
    [intensity, disabled, mode, prefersReduced],
  )

  const containerStyle: CSSProperties = {
    position: "relative",
    overflow,
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
