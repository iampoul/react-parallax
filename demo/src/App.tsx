import "./index.css"
import { useState } from "react"
import { Parallax, ParallaxLayer } from "@iampoul/react-parallax"

// ─── Shared colours ────────────────────────────────────────────────────────────
const purple = "#7c4dff"
const pink = "#e040fb"
const teal = "#00bcd4"

// ─── Section 1: Scroll mode ────────────────────────────────────────────────────
function ScrollDemo() {
  return (
    <section>
      <p className="section-title">Issue #11 + scroll mode</p>
      <h2 className="section-heading">Scroll Parallax</h2>
      <p className="section-desc">
        Multiple layers with different <code>speed</code> values and a{" "}
        <code>scrollRange="30%"</code> percentage to stay proportional.
      </p>

      <div className="demo-stage">
        <Parallax mode="scroll" style={{ height: 340 }}>
          {/* Distant background blob */}
          <ParallaxLayer
            speed={0.6}
            scrollRange="30%"
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{
              width: 260, height: 260, borderRadius: "50%",
              background: `radial-gradient(circle, ${purple}44, transparent 70%)`,
            }} />
          </ParallaxLayer>

          {/* Mid layer */}
          <ParallaxLayer
            speed={0.3}
            scrollRange="30%"
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{
              width: 140, height: 140, borderRadius: 24,
              background: `linear-gradient(135deg, ${purple}, ${pink})`,
              opacity: 0.7,
              transform: "rotate(15deg)",
            }} />
          </ParallaxLayer>

          {/* Foreground fast layer */}
          <ParallaxLayer
            speed={-0.2}
            scrollRange="30%"
            zIndex={2}
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: teal, boxShadow: `0 0 32px ${teal}88`,
            }} />
          </ParallaxLayer>

          {/* Center label */}
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 8, zIndex: 3,
          }}>
            <p className="label">scroll me</p>
          </div>
        </Parallax>
      </div>
    </section>
  )
}

// ─── Section 2: Pointer mode ───────────────────────────────────────────────────
function PointerDemo() {
  return (
    <section>
      <p className="section-title">Pointer mode</p>
      <h2 className="section-heading">Mouse Parallax</h2>
      <p className="section-desc">
        <code>mode="pointer"</code> with per-layer <code>pointerStrength</code>.
        Move your cursor over the card.
      </p>

      <div className="demo-stage">
        <Parallax
          mode="pointer"
          smoothing={0.08}
          style={{ height: 340, cursor: "crosshair" }}
        >
          <ParallaxLayer
            pointerStrength={30}
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{
              width: 300, height: 200, borderRadius: 20,
              background: `linear-gradient(135deg, ${purple}55, ${pink}55)`,
              border: `1px solid ${purple}88`,
            }} />
          </ParallaxLayer>

          <ParallaxLayer
            pointerStrength={18}
            zIndex={1}
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: 16,
              background: `linear-gradient(135deg, ${purple}, ${pink})`,
              boxShadow: `0 8px 40px ${purple}66`,
            }} />
          </ParallaxLayer>

          <ParallaxLayer
            pointerStrength={8}
            zIndex={2}
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "#fff", boxShadow: "0 0 16px #fff8",
            }} />
          </ParallaxLayer>
        </Parallax>
      </div>
    </section>
  )
}

// ─── Section 3: Depth of field ─────────────────────────────────────────────────
function DepthOfFieldDemo() {
  return (
    <section>
      <p className="section-title">Issue #3 (blur + blurBase)</p>
      <h2 className="section-heading">Depth of Field</h2>
      <p className="section-desc">
        Combine <code>blurBase</code> for always-soft background layers and{" "}
        <code>blur</code> for scroll-driven focus changes.
      </p>

      <div className="demo-stage">
        <Parallax mode="scroll" style={{ height: 340 }}>
          {/* Always blurry background */}
          <ParallaxLayer
            speed={0.5}
            blurBase={5}
            scrollRange="25%"
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{
              width: 280, height: 280, borderRadius: "50%",
              background: `radial-gradient(circle, ${pink}66, transparent 70%)`,
            }} />
          </ParallaxLayer>

          {/* Scroll-driven blur — sharp at center */}
          <ParallaxLayer
            speed={0.2}
            blur={6}
            scrollRange="25%"
            zIndex={1}
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{
              width: 120, height: 120, borderRadius: 20,
              background: `linear-gradient(135deg, ${teal}, ${purple})`,
            }} />
          </ParallaxLayer>

          {/* Sharp focal point */}
          <ParallaxLayer
            speed={0}
            zIndex={2}
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "#fff", boxShadow: "0 0 24px #fffc",
            }} />
          </ParallaxLayer>
        </Parallax>
      </div>
    </section>
  )
}

// ─── Section 4: Spring physics ─────────────────────────────────────────────────
function SpringDemo() {
  return (
    <section>
      <p className="section-title">Issue #8 (springConfig)</p>
      <h2 className="section-heading">Spring Physics</h2>
      <p className="section-desc">
        <code>springConfig</code> replaces lerp with spring dynamics.
        Move your cursor — notice the natural overshoot.
      </p>

      <div className="demo-stage">
        <Parallax
          mode="pointer"
          springConfig={{ stiffness: 80, damping: 8 }}
          style={{ height: 340, cursor: "crosshair" }}
        >
          {[40, 24, 14].map((size, i) => (
            <ParallaxLayer
              key={i}
              pointerStrength={10 + i * 12}
              zIndex={i}
              style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <div style={{
                width: size * 3, height: size * 3, borderRadius: "50%",
                background: `radial-gradient(circle, ${[purple, pink, teal][i]}99, transparent 70%)`,
              }} />
            </ParallaxLayer>
          ))}
        </Parallax>
      </div>
    </section>
  )
}

// ─── Section 5: onProgress ─────────────────────────────────────────────────────
function OnProgressDemo() {
  const [progress, setProgress] = useState(0.5)

  return (
    <section>
      <p className="section-title">Issue #7 (onProgress)</p>
      <h2 className="section-heading">onProgress Callback</h2>
      <p className="section-desc">
        <code>onProgress</code> fires every frame with the current state —
        drive any external UI without <code>useParallax()</code>.
      </p>

      <div className="demo-stage">
        <Parallax
          mode="scroll"
          onProgress={(s) => setProgress(s.scrollProgress)}
          style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}
        >
          <ParallaxLayer
            speed={0.3}
            scrollRange="20%"
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{
              width: 200, height: 200, borderRadius: "50%",
              background: `radial-gradient(circle, ${purple}44, transparent 70%)`,
            }} />
          </ParallaxLayer>

          <p className="label" style={{ position: "relative", zIndex: 1 }}>scroll progress</p>
          <div className="progress-bar-track" style={{ position: "relative", zIndex: 1 }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p style={{ fontSize: 13, color: "#aaa", position: "relative", zIndex: 1 }}>
            {(progress * 100).toFixed(1)}%
          </p>
        </Parallax>
      </div>
    </section>
  )
}

// ─── Section 6: Rotate + Scale + Fade ─────────────────────────────────────────
function EffectsDemo() {
  return (
    <section>
      <p className="section-title">Composable effects</p>
      <h2 className="section-heading">Rotate · Scale · Fade</h2>
      <p className="section-desc">
        Combine <code>rotate</code>, <code>scale</code>, and <code>fade</code>{" "}
        for rich compositional effects as you scroll.
      </p>

      <div className="demo-stage">
        <Parallax mode="scroll" style={{ height: 380 }}>
          <ParallaxLayer
            speed={0.4}
            rotate={30}
            scale={0.3}
            fade={0.2}
            scrollRange={160}
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <div style={{
              width: 160, height: 160,
              borderRadius: 32,
              background: `linear-gradient(135deg, ${purple}, ${pink})`,
            }} />
          </ParallaxLayer>

          <ParallaxLayer
            speed={-0.2}
            rotate={-20}
            scrollRange={120}
            zIndex={1}
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              marginLeft: 80, marginTop: -60,
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: 16,
              background: teal,
            }} />
          </ParallaxLayer>

          <ParallaxLayer
            speed={0.5}
            scale={0.4}
            fade={0}
            scrollRange={100}
            zIndex={2}
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              marginLeft: -100, marginTop: 60,
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: pink,
            }} />
          </ParallaxLayer>
        </Parallax>
      </div>
    </section>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <div style={{ padding: "80px 40px 40px", maxWidth: 900, margin: "0 auto" }}>
        <p className="label" style={{ marginBottom: 12 }}>@iampoul/react-parallax</p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 1.1, marginBottom: 20 }}>
          Interactive Demo
        </h1>
        <p style={{ color: "#888", fontSize: 16, maxWidth: 500, lineHeight: 1.6 }}>
          All features in one place. Scroll down to see each effect — or move
          your cursor over the pointer demos.
        </p>
      </div>

      <div className="divider" />
      <ScrollDemo />
      <div className="divider" />
      <PointerDemo />
      <div className="divider" />
      <DepthOfFieldDemo />
      <div className="divider" />
      <SpringDemo />
      <div className="divider" />
      <OnProgressDemo />
      <div className="divider" />
      <EffectsDemo />

      <div style={{ padding: "80px 40px", textAlign: "center", color: "#444", fontSize: 13 }}>
        github.com/iampoul/react-parallax
      </div>
    </>
  )
}
