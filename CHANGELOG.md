# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2026-06-12

### Added

- `direction` prop on `<Parallax>` (`"vertical"` | `"horizontal"`, default `"vertical"`). When set to `"horizontal"`, scroll progress is measured left-to-right across the viewport instead of top-to-bottom — enabling first-class support for side-scrolling layouts, horizontal timelines, and carousel sections.
- `direction` is now part of `ParallaxContextValue` so `<ParallaxLayer>` and custom hooks can read it via `useParallax()`.
- `scrollRange="%"` on `<ParallaxLayer>` now resolves against the container **width** when `direction="horizontal"` (previously always resolved against height).

## [0.6.0] - 2026-06-11

### Fixed

- `containerEl` in context was a stale snapshot of `containerRef.current` set at memo time — replaced with the ref object itself so `scrollRange="%"` always reads the live container height on every frame, even after resize or late mount

### Performance

- rAF loop now pauses automatically via `IntersectionObserver` when the `<Parallax>` container is fully off-screen, and resumes as soon as any pixel re-enters the viewport. Combined with the existing tab-visibility pause, this means the loop only runs when it can actually be seen.

## [0.5.0] - 2026-06-11

### Added

- `onProgress` callback prop on `<Parallax>` — fires every animation frame with the current `ParallaxState`, enabling external UI to be driven without the `useParallax()` hook (closes #7)
- `springConfig` prop on `<Parallax>` — adds spring physics as an alternative to lerp `smoothing`, with `stiffness` and `damping` controls for natural overshoot and bounce (closes #8)
- `scrollRange` now accepts percentage strings (e.g. `"25%"`) derived from the container's height, keeping motion proportional across screen sizes (closes #11)
- Interactive Vite demo app in `demo/` showcasing all features: scroll, pointer, depth-of-field, spring physics, `onProgress`, and composable effects (closes #10)
- Unit and integration test suite using Vitest + @testing-library/react with 16 tests covering all major behaviours (closes #9)
- `test`, `test:watch`, and `test:coverage` scripts

## [0.4.0] - 2026-06-11

### Fixed

- `prefers-reduced-motion` is now reactive — OS-level motion preference changes mid-session correctly disable all parallax motion without a page reload (converted `prefersReduced` from a ref to state)
- `prefers-reduced-motion` was always `false` on first render due to being read before the effect ran — now correctly initialised in the same effect that attaches the media query listener
- rAF loop now pauses when the browser tab is hidden (`visibilitychange`) and resumes when the tab becomes visible again, eliminating wasted CPU in background tabs

### Added

- `scrollParent` prop on `<Parallax>` — attach scroll listener to a custom scrollable element instead of `window`; use when the component lives inside a modal, sidebar, or overflow container
- `overflow` prop on `<Parallax>` — controls CSS overflow on the container (default `"hidden"`); set to `"visible"` to allow layers to bleed outside the container bounds

## [0.3.0] - 2026-06-11

_Version bump to republish — 0.2.0 could not be rebuilt after initial publish._

### Added

- `blur` prop on `<ParallaxLayer>` — dynamic depth-of-field effect: `0px` when centered in the viewport, increases to the specified value toward scroll edges
- `blurBase` prop on `<ParallaxLayer>` — constant blur always applied, for layers that should permanently appear out of focus (e.g. a soft background behind a sharp focal element). Composes with `blur`: total = `blurBase + abs(scrollEdge) * blur`
- `willChange` automatically includes `filter` when either blur prop is active
- GitHub Actions workflow to publish to both npm and GitHub Packages on release

## [0.2.0] - 2026-06-10

### Added

- `blur` prop on `<ParallaxLayer>` — applies a dynamic `blur()` CSS filter for a depth-of-field camera focus effect. Blur is `0px` when the container is centered in the viewport (in focus) and increases up to the specified value toward the scroll edges (out of focus).
- `blurBase` prop on `<ParallaxLayer>` — applies a constant blur regardless of scroll position. Useful for layers that should always appear out of focus (e.g. a soft background behind a sharp focal element). Composes with `blur`: total blur = `blurBase + abs(scrollEdge) * blur`. `willChange` is automatically extended to include `filter` when either blur prop is active.

## [0.1.0] - 2026-06-10

### Added

- Initial release
- `<Parallax>` container component with scroll/pointer tracking
- `<ParallaxLayer>` component with configurable speed, rotation, scale, and fade
- `useParallax()` hook for custom integrations
- Support for `prefers-reduced-motion` accessibility preference
- ESM and CommonJS builds with TypeScript declarations
