"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CHARS = " .:-=+*#%@";
const FILTER_ID = "hero-ascii-tint";
const TWO_PI = Math.PI * 2;

export type GlyphSignal = "luminance" | "red" | "green" | "blue";
export type ShapeKind = "none" | "circle" | "roundedRect";

export interface ShaderTuning {
  colsStart: number;
  colsEnd: number;
  minCellPx: number;
  shimmerAmount: number;
  shimmerSpeed: number;
  durationMs: number;
  gamma: number;
  threshold: number;
  blackPoint: number;
  whitePoint: number;
  glyphSignal: GlyphSignal;
  shape: ShapeKind;
  cornerRadius: number;
  shapeSoftness: number;
  edgeFade: number;
}

const BASE_TUNING = {
  colsStart: 30,
  colsEnd: 150,
  minCellPx: 4,
  shimmerAmount: 0.1,
  shimmerSpeed: 5,
  durationMs: 4000,
  shape: "none",
  cornerRadius: 0,
  shapeSoftness: 8,
  edgeFade: 1,
} as const;

// SDF for rounded rectangle, centered at origin.
// Returns negative distance inside, positive outside (in the same units as px/py).
function sdfRoundedRect(px: number, py: number, halfW: number, halfH: number, r: number): number {
  const qx = Math.abs(px) - halfW + r;
  const qy = Math.abs(py) - halfH + r;
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

type CurveFields = Pick<ShaderTuning, "gamma" | "threshold" | "blackPoint" | "whitePoint" | "glyphSignal">;

export const SHADER_TUNING_PRESETS = {
  X: { gamma: 2, threshold: 0.25, blackPoint: 0, whitePoint: 1, glyphSignal: "luminance" },
  Y: { gamma: 1.5, threshold: 0.15, blackPoint: 0, whitePoint: 1, glyphSignal: "luminance" },
  Z: { gamma: 1, threshold: 0.3, blackPoint: 0, whitePoint: 1, glyphSignal: "luminance" },
} as const satisfies Record<"X" | "Y" | "Z", CurveFields>;

const LIGHT_CURVE = {
  gamma: 3, threshold: 0.3, blackPoint: 0.49, whitePoint: 0.8,
  glyphSignal: "green",
} as const satisfies CurveFields;

const DARK_CURVE = {
  gamma: 1, threshold: 0.15, blackPoint: 0, whitePoint: 1,
  glyphSignal: "luminance",
} as const satisfies CurveFields;

const SHAPE_DEFAULTS = {
  shape: "circle" as ShapeKind,
  cornerRadius: 0,
  shapeSoftness: 1,
  edgeFade: 1,
};

const LIGHT_THEME_TUNING: ShaderTuning = { ...BASE_TUNING, ...LIGHT_CURVE, ...SHAPE_DEFAULTS };
const DARK_THEME_TUNING: ShaderTuning = { ...BASE_TUNING, ...DARK_CURVE, ...SHAPE_DEFAULTS };

export function tuningForTheme(isLight: boolean): ShaderTuning {
  return isLight ? LIGHT_THEME_TUNING : DARK_THEME_TUNING;
}

export const SHADER_TUNING_DEFAULTS: ShaderTuning = {
  ...BASE_TUNING,
  ...SHADER_TUNING_PRESETS.Z,
  ...SHAPE_DEFAULTS,
};

function buildSignalLUT(t: ShaderTuning, isLight: boolean): Uint8Array {
  const lut = new Uint8Array(256);
  const range = Math.max(t.whitePoint - t.blackPoint, 1e-6);
  for (let b = 0; b < 256; b++) {
    let s = b / 255;
    if (isLight) s = 1 - s;
    s = Math.min(1, Math.max(0, (s - t.blackPoint) / range));
    s = Math.pow(s, t.gamma);
    lut[b] = (s * 255) | 0;
  }
  return lut;
}

const SIN_LUT_SIZE = 256;
const SIN_LUT_MASK = SIN_LUT_SIZE - 1;
const SIN_LUT = new Float32Array(SIN_LUT_SIZE);
for (let i = 0; i < SIN_LUT_SIZE; i++) {
  SIN_LUT[i] = Math.sin((i / SIN_LUT_SIZE) * TWO_PI);
}

function fastHash(x: number, y: number): number {
  let n = x * 374761393 + y * 668265263;
  n = (n ^ (n >>> 13)) * 1274126177;
  n = n ^ (n >>> 16);
  return (n >>> 0) / 0xffffffff;
}

type Variant = "X" | "Y" | "Z";

export function HeroAscii({
  className,
  variant = "Z",
  tuning,
}: {
  className?: string;
  variant?: Variant;
  tuning?: Partial<ShaderTuning>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isLightRef = useRef(true);
  const scrambleStartRef = useRef(0);

  const resolveTuning = useCallback((): ShaderTuning => {
    const themed = tuningForTheme(isLightRef.current);
    if (!tuning) return themed;
    return {
      ...themed,
      ...SHADER_TUNING_PRESETS[variant],
      ...tuning,
    };
  }, [tuning, variant]);

  const tuningRef = useRef<ShaderTuning>(resolveTuning());
  const [reducedMotion, setReducedMotion] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    tuningRef.current = resolveTuning();
  }, [resolveTuning]);

  useEffect(() => {
    const onTheme = (e: Event) => {
      const detail = (e as CustomEvent<{ isLight: boolean }>).detail;
      if (!detail) return;
      isLightRef.current = detail.isLight;
      tuningRef.current = resolveTuning();
      scrambleStartRef.current = performance.now();
    };
    window.addEventListener("themechange", onTheme);
    return () => window.removeEventListener("themechange", onTheme);
  }, [resolveTuning]);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(m.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  const handleReplay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.ended || v.paused) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!video || !canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const sample = document.createElement("canvas");
    const sCtx = sample.getContext("2d", { willReadFrequently: true });
    if (!sCtx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    const resize = () => {
      w = Math.max(1, wrap.clientWidth);
      h = Math.max(1, wrap.clientHeight);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const tu = tuningRef.current;
      const t = Math.min(1, (now - start) / tu.durationMs);
      const targetCols = tu.colsStart + (tu.colsEnd - tu.colsStart) * easeInOutCubic(t);
      const cell = Math.max(tu.minCellPx, w / targetCols);
      const cols = Math.max(1, Math.floor(w / cell));
      const rows = Math.max(1, Math.floor(h / cell));

      ctx.clearRect(0, 0, w, h);

      if (video.readyState >= 2 && video.videoWidth > 0) {
        sample.width = cols;
        sample.height = rows;

        const vAR = video.videoWidth / video.videoHeight;
        const cAR = cols / rows;
        let dw = cols, dh = rows, dx = 0, dy = 0;
        if (vAR > cAR) {
          dh = cols / vAR;
          dy = (rows - dh) / 2;
        } else {
          dw = rows * vAR;
          dx = (cols - dw) / 2;
        }

        sCtx.clearRect(0, 0, cols, rows);
        sCtx.drawImage(video, dx, dy, dw, dh);
        const data = sCtx.getImageData(0, 0, cols, rows).data;

        ctx.font = `bold ${cell * 0.95}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
        ctx.textBaseline = "top";
        ctx.fillStyle = "#ffffff";

        const tSec = (now - start) / 1000;
        const shimmerOn = !reducedMotion;
        const timePhase = tSec * tu.shimmerSpeed;
        const shimmerAmt = tu.shimmerAmount;
        const isLight = isLightRef.current;
        const signalLut = buildSignalLUT(tu, isLight);
        const thr = tu.threshold;
        const sigMode = tu.glyphSignal;
        const charsLen = CHARS.length;
        const useShape = tu.shape !== "none";
        // Compute shape geometry in pixel space (cell = px-per-cell, hoist for inner loop).
        // Center is the canvas center; shape covers the full frame (w x h pixels).
        const shapeCxPx = w * 0.5;
        const shapeCyPx = h * 0.5;
        const halfW = w * 0.5;
        const halfH = h * 0.5;
        const cornerR = tu.shape === "roundedRect"
          ? Math.min(tu.cornerRadius, halfW, halfH)
          : tu.shape === "circle"
            ? Math.min(halfW, halfH)
            : 0;
        const softness = Math.max(1, tu.shapeSoftness);
        const scrambleStart = scrambleStartRef.current;
        const sp = scrambleStart > 0 ? Math.min(1, (now - scrambleStart) / 500) : 1;
        const frameSeed = (now * 0.01) | 0;
        const noiseBin = (now * 0.0015) | 0;

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const i = (y * cols + x) * 4;
            const sigByte =
              sigMode === "red"   ? data[i]
            : sigMode === "green" ? data[i + 1]
            : sigMode === "blue"  ? data[i + 2]
            : (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) | 0;
            let v = signalLut[sigByte] / 255;
            if (shimmerOn) {
              const phase = timePhase + fastHash(x, y) * TWO_PI;
              const lutIdx = ((phase / TWO_PI) * SIN_LUT_SIZE) | 0;
              v += SIN_LUT[lutIdx & SIN_LUT_MASK] * 0.5 * shimmerAmt * 0.4;
            }
            let localThr = thr;
            if (useShape) {
              // Pixel-space position of cell center
              const px = (x + 0.5) * cell - shapeCxPx;
              const py = (y + 0.5) * cell - shapeCyPx;
              const sd = tu.shape === "circle"
                ? Math.hypot(px, py) - cornerR
                : sdfRoundedRect(px, py, halfW, halfH, cornerR);
              // edge: 0 inside (sd <= -softness), 1 fully outside (sd >= softness)
              const edge = smoothstep(-softness, softness, sd);
              if (edge > 0) {
                const fade = edge * tu.edgeFade;
                v *= 1 - fade * 0.7;
                const noise = (fastHash(x + noiseBin, y + 41) - 0.5) * 0.25 * fade;
                localThr = thr + (1 - thr) * fade * 0.7 + noise;
              }
            }
            if (v < localThr) continue;
            if (v > 1) v = 1;
            const targetIdx = Math.min(charsLen - 1, (v * charsLen) | 0);
            const settled = sp >= 1 || fastHash(x + 91, y + 17) < sp;
            const idx = settled
              ? targetIdx
              : ((fastHash(x + frameSeed, y) * charsLen) | 0) % charsLen;
            ctx.fillText(CHARS[idx], x * cell, y * cell);
          }
        }
        if (sp >= 1 && scrambleStart > 0) scrambleStartRef.current = 0;
      }

      raf = requestAnimationFrame(tick);
    };

    video.play().catch(() => {});
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reducedMotion, variant]);

  return (
    <div
      ref={wrapRef}
      className={className}
      aria-hidden
      onMouseEnter={canHover ? handleReplay : undefined}
    >
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", pointerEvents: "none" }}
      >
        <filter id={FILTER_ID} colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="lum" />
          <feFlood style={{ floodColor: "var(--foreground)" }} result="flood" />
          <feComposite in="flood" in2="lum" operator="in" />
        </filter>
      </svg>
      <video
        ref={videoRef}
        src="/shaders/yashay.mp4"
        muted
        playsInline
        autoPlay
        preload="auto"
        crossOrigin="anonymous"
        style={{ display: "none" }}
      />
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ filter: `url(#${FILTER_ID})` }}
        />
      )}
    </div>
  );
}
