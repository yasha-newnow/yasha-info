"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";

// Fixed multi-color rainbow — reads as "colors live here" on its own and is
// intentionally independent of the live accent.
const RAINBOW_GRADIENT =
  "conic-gradient(from 0deg, #ff2bd6, #00f0ff, #c6ff00, #ff8a00, #ff2bd6)";

// Tuned + baked values. The pulse curves/timings live in globals.css
// (halo-pulse-inner / halo-pulse-outer / halo-spin).
const INNER = { size: 160, blur: 20 };
const OUTER = { size: 248, blur: 50 };
const OFFSET_X = -12;
const OFFSET_Y = -12;
const CYCLE_S = 6; // visible pulse length (matches the CSS keyframe duration)
const ARC_BASE = 10; // base rest between pulses (s)
const ARC_AFTER_OPEN = 60; // once the palette was opened
const ARC_AFTER_PICK = 180; // once a color was actually picked

interface GradientAttentionProps {
  /** Picker closed, not hovered, and entrance finished → gate visible. */
  active: boolean;
  /** Entrance animation finished → start the loop. */
  ready: boolean;
  hasOpened: boolean;
  hasPicked: boolean;
}

const layerBase: CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  borderRadius: "50%",
  background: RAINBOW_GRADIENT,
  opacity: 0,
  willChange: "transform, opacity",
};

/**
 * Rainbow Halo — two stacked rainbow discs (inner small/sharp, outer large/soft)
 * that grow from the button center and collapse back, behind the color-picker
 * button. The gradient angle spins continuously.
 *
 * Baked: the continuous pulse + spin run as pure CSS animations (on the
 * compositor, off the main thread — no rAF jank next to the ASCII shader). JS
 * does only the cheap bits: schedule each replay (setTimeout, with the pause and
 * its interaction-escalation), and toggle the gate (hover / picker open) via a
 * CSS opacity+scale transition that retargets smoothly on fast hover.
 */
export function GradientAttention({ active, ready, hasOpened, hasPicked }: GradientAttentionProps) {
  const reducedMotion = useReducedMotion();
  // Each tick remounts the two layers → their CSS pulse animations replay.
  const [tick, setTick] = useState(0);

  const effectiveArc = hasPicked ? ARC_AFTER_PICK : hasOpened ? ARC_AFTER_OPEN : ARC_BASE;

  // Replay scheduler: the first pulse is the initial mount (when `ready`); every
  // (cycle + arc) seconds after, bump the key to replay. Runs regardless of
  // hover so the gate just reveals wherever the loop is. setTimeout only — the
  // animation itself is CSS.
  useEffect(() => {
    if (reducedMotion || !ready) return;
    let timer: ReturnType<typeof setTimeout>;
    const period = (CYCLE_S + effectiveArc) * 1000;
    const loop = () => {
      setTick((t) => t + 1);
      timer = setTimeout(loop, period);
    };
    timer = setTimeout(loop, period);
    return () => clearTimeout(timer);
  }, [reducedMotion, ready, effectiveArc]);

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      {/* Gate: show/hide via CSS transition (interruptible — fast hover-through
          fades smoothly instead of snapping). Exit reuses the disappear feel. */}
      <div
        style={{
          opacity: active ? 1 : 0,
          transform: active ? "scale(1)" : "scale(0.6)",
          transition: active
            ? "opacity 0.4s cubic-bezier(0.23,1,0.32,1), transform 0.4s cubic-bezier(0.23,1,0.32,1)"
            : "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
          willChange: "transform, opacity",
        }}
      >
        {/* Offset of the whole glow from the button center. */}
        <div style={{ transform: `translate(${OFFSET_X}px, ${OFFSET_Y}px)` }}>
          {/* Mount the spinning glow only once the entrance is done. */}
          {ready && (
            <div
              className="halo-spin"
              style={{ position: "relative", width: 0, height: 0, willChange: "transform" }}
            >
              <div
                key={`o${tick}`}
                className="halo-pulse-outer"
                style={{
                  ...layerBase,
                  width: OUTER.size,
                  height: OUTER.size,
                  marginLeft: -OUTER.size / 2,
                  marginTop: -OUTER.size / 2,
                  filter: `blur(${OUTER.blur}px)`,
                }}
              />
              <div
                key={`i${tick}`}
                className="halo-pulse-inner"
                style={{
                  ...layerBase,
                  width: INNER.size,
                  height: INNER.size,
                  marginLeft: -INNER.size / 2,
                  marginTop: -INNER.size / 2,
                  filter: `blur(${INNER.blur}px)`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
