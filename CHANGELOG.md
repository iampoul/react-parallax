# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-06-10

### Added

- `blur` prop on `<ParallaxLayer>` — applies a dynamic `blur()` CSS filter for a depth-of-field camera focus effect. Blur is `0px` when the container is centered in the viewport (in focus) and increases up to the specified value toward the scroll edges (out of focus). `willChange` is automatically extended to include `filter` when blur is active.

## [0.1.0] - 2026-06-10

### Added

- Initial release
- `<Parallax>` container component with scroll/pointer tracking
- `<ParallaxLayer>` component with configurable speed, rotation, scale, and fade
- `useParallax()` hook for custom integrations
- Support for `prefers-reduced-motion` accessibility preference
- ESM and CommonJS builds with TypeScript declarations
