# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
