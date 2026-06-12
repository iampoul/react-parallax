"use client"

import React, { createContext, useContext } from "react"

/**
 * The live motion state shared from the <Parallax> container to every
 * <ParallaxLayer> child on each animation frame.
 */
export interface ParallaxState {
  /**
   * Vertical scroll progress of the container relative to the viewport.
   * 0   -> container top edge just entered the bottom of the viewport
   * 0.5 -> container is centered in the viewport
   * 1   -> container bottom edge just left the top of the viewport
   */
  scrollProgress: number
  /** Normalized pointer X position over the container, from -1 (left) to 1 (right). */
  pointerX: number
  /** Normalized pointer Y position over the container, from -1 (top) to 1 (bottom). */
  pointerY: number
}

type Subscriber = (state: ParallaxState) => void

export interface ParallaxContextValue {
  /** Global multiplier applied to every layer's movement. */
  intensity: number
  /** When true, all parallax motion is paused (e.g. reduced-motion users). */
  disabled: boolean
  /** Whether scroll-based and/or pointer-based motion is enabled. */
  mode: "scroll" | "pointer" | "both"
  /**
   * Which scroll axis drives `scrollProgress`.
   * `"vertical"` (default) measures the container's position top-to-bottom in the viewport.
   * `"horizontal"` measures left-to-right — use for side-scrolling layouts.
   */
  direction: "vertical" | "horizontal"
  /** Register a layer to receive motion-state updates. Returns an unsubscribe fn. */
  subscribe: (cb: Subscriber) => () => void
  /** Read the most recent motion state synchronously (used for first paint). */
  getState: () => ParallaxState
  /** Ref to the <Parallax> container DOM element — always current, used by layers to resolve relative values. */
  containerRef: React.RefObject<HTMLElement | null>
}

export const ParallaxContext = createContext<ParallaxContextValue | null>(null)

export function useParallax(): ParallaxContextValue {
  const ctx = useContext(ParallaxContext)
  if (!ctx) {
    throw new Error("<ParallaxLayer> must be rendered inside a <Parallax> container.")
  }
  return ctx
}
