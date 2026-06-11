# @iampoul/react-parallax

A performant, accessible React parallax component with scroll and pointer-based motion.

## Installation

```bash
npm install @iampoul/react-parallax
```

## Usage

```tsx
import { Parallax, ParallaxLayer } from "@iampoul/react-parallax"

function App() {
  return (
    <Parallax mode="both" intensity={1} smoothing={0.12}>
      {/* Background layer - moves slower, appears further */}
      <ParallaxLayer speed={0.5} pointerStrength={20}>
        <img src="/background.png" alt="" />
      </ParallaxLayer>

      {/* Foreground layer - moves faster, appears closer */}
      <ParallaxLayer speed={-0.3} pointerStrength={40} zIndex={1}>
        <img src="/foreground.png" alt="" />
      </ParallaxLayer>
    </Parallax>
  )
}
```

## API

### `<Parallax>`

The container that tracks scroll + pointer motion and broadcasts it to child layers.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `"scroll" \| "pointer" \| "both"` | `"both"` | Which inputs drive the parallax effect |
| `intensity` | `number` | `1` | Global movement multiplier (0.5 = subtle, 2 = dramatic) |
| `smoothing` | `number` | `0.12` | Easing factor (lower = floatier, 1 = instant) |
| `disabled` | `boolean` | `false` | Pause all motion (auto-enabled for reduced-motion) |
| `scrollParent` | `HTMLElement \| null` | `window` | Custom scroll container — use when `<Parallax>` is inside a scrollable div, modal, or sidebar |
| `overflow` | `string` | `"hidden"` | CSS overflow on the container — set to `"visible"` to let layers bleed outside bounds |
| `as` | `ElementType` | `"div"` | HTML element to render |
| `className` | `string` | – | CSS class for the container |
| `style` | `CSSProperties` | – | Inline styles |

### `<ParallaxLayer>`

A single moving object inside a `<Parallax>` container.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `speed` | `number` | `0.3` | Depth: 0 = locked, >0 = slower/background, <0 = faster/foreground |
| `pointerStrength` | `number` | `0` | Pixels of travel from pointer movement |
| `scrollRange` | `number` | `120` | Max pixels of scroll travel |
| `axis` | `"x" \| "y" \| "both"` | `"y"` | Axis for scroll parallax |
| `rotate` | `number` | `0` | Degrees of rotation across scroll range |
| `scale` | `number` | `0` | Extra scale at scroll edges (0.2 = +20%) |
| `fade` | `number` | `1` | Opacity at edges (1 = no fade) |
| `blur` | `number` | `0` | Max blur in px at scroll edges, `0` at center — creates a depth-of-field focus effect |
| `blurBase` | `number` | `0` | Constant blur in px always applied — use for layers that should always appear out of focus |
| `zIndex` | `number` | `0` | Stacking order |
| `as` | `ElementType` | `"div"` | HTML element to render |
| `className` | `string` | – | CSS class |
| `style` | `CSSProperties` | – | Inline styles |

### `useParallax()`

Hook to access the parallax context from custom components.

```tsx
const { intensity, disabled, mode, subscribe, getState } = useParallax()
```

## Features

- **Zero dependencies** (only React peer dependency)
- **Performant** - Single rAF loop, ref-based subscriptions, no React re-renders
- **Accessible** - Respects `prefers-reduced-motion`
- **Flexible** - Scroll, pointer, or both; customize speed, rotation, scale, fade
- **TypeScript** - Full type definitions included

## License

MIT
