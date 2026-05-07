"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HeroAscii } from "./hero-ascii";

// Cubic-bezier evaluator (Newton-Raphson) — mirrors browser CSS easing for
// `[p1x, p1y, p2x, p2y]`. Used to animate layout properties ourselves so we
// can drive them off transform pipeline (which causes the desktop snap).
function makeCubicBezier(coords: [number, number, number, number]): (t: number) => number {
  const [p1x, p1y, p2x, p2y] = coords;
  const ax = 1 - 3 * p2x + 3 * p1x;
  const bx = 3 * p2x - 6 * p1x;
  const cx = 3 * p1x;
  const ay = 1 - 3 * p2y + 3 * p1y;
  const by = 3 * p2y - 6 * p1y;
  const cy = 3 * p1y;
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let x = t;
    for (let i = 0; i < 6; i++) {
      const xCur = ((ax * x + bx) * x + cx) * x;
      const dxCur = (3 * ax * x + 2 * bx) * x + cx;
      if (Math.abs(dxCur) < 1e-6) break;
      x = x - (xCur - t) / dxCur;
    }
    return ((ay * x + by) * x + cy) * x;
  };
}

const TITLE_LINES = ["I'm Yasha,", "Product Designer."];
const DESCRIPTION =
  "10+ years driving $20M+ revenue through research & leadership in Apps, FinTech & Complex B2B";

const TITLE_CHAR_STAGGER = 0.04;
const TITLE_CHAR_DURATION = 0.3;
const DESCRIPTION_WORD_STAGGER = 0.05;
const DESCRIPTION_WORD_DURATION = 0.3;

export type EntranceEasingKey =
  | "easeOutStrong"
  | "iosDrawer"
  | "easeInOutCubic"
  | "sCurve";

export const ENTRANCE_EASINGS: Record<
  EntranceEasingKey,
  [number, number, number, number]
> = {
  easeOutStrong: [0.16, 1, 0.3, 1],
  iosDrawer: [0.32, 0.72, 0, 1],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  sCurve: [0.85, 0, 0.15, 1],
};

export interface EntranceTuning {
  duration: number;
  initialScale: number;
  easing: EntranceEasingKey;
  shaderDelay: number;
  titleDelay: number;
  descriptionDelay: number;
}

export const DEFAULT_ENTRANCE_TUNING: EntranceTuning = {
  duration: 1.2,
  initialScale: 1.6,
  easing: "iosDrawer",
  shaderDelay: 1.5,
  titleDelay: 1.7,
  descriptionDelay: 2.6,
};

interface HeroProps {
  onEntranceComplete?: () => void;
  entranceTuning?: EntranceTuning;
}

export function Hero({
  onEntranceComplete,
  entranceTuning = DEFAULT_ENTRANCE_TUNING,
}: HeroProps) {
  const reducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const shaderRef = useRef<HTMLDivElement>(null);
  const didAnimateRef = useRef(false);

  useLayoutEffect(() => {
    if (reducedMotion || didAnimateRef.current) return;
    const wrapper = wrapperRef.current;
    const shader = shaderRef.current;
    if (!wrapper || !shader) return;
    didAnimateRef.current = true;

    const wRect = wrapper.getBoundingClientRect();
    const baseSize = wRect.width;
    const dx = window.innerWidth / 2 - (wRect.left + wRect.width / 2);
    const dy = window.innerHeight / 2 - (wRect.top + wRect.height / 2);
    const initialScale = entranceTuning.initialScale;

    // Replicate the original "scale 1.6 → 1.0 + translate from viewport center"
    // entrance using **layout properties only** — no CSS transform anywhere.
    //
    //  - Outer wrapper (in flex flow): animates `left`/`top` (translate from
    //    viewport center → layout position). `position: relative` keeps the
    //    layout slot reserved without affecting siblings.
    //  - Inner shader: animates `width`/`height` and `left`/`top` (scale from
    //    1.6×, centered in the wrapper). `position: absolute` so its size
    //    growth doesn't push surrounding layout — it overflows visually,
    //    matching the old CSS transform character.
    //
    // Smooth animation depends on HeroAscii's tick() syncing canvas physical
    // size to wrap.clientWidth in the same RAF — see the matching change in
    // hero-ascii.tsx tick().
    wrapper.style.position = "relative";
    wrapper.style.left = `${dx}px`;
    wrapper.style.top = `${dy}px`;
    wrapper.style.opacity = "1";

    const startSize = baseSize * initialScale;
    const startOffset = (baseSize - startSize) / 2;
    shader.style.position = "absolute";
    shader.style.width = `${startSize}px`;
    shader.style.height = `${startSize}px`;
    shader.style.left = `${startOffset}px`;
    shader.style.top = `${startOffset}px`;

    const easing = makeCubicBezier(ENTRANCE_EASINGS[entranceTuning.easing]);
    const delayMs = entranceTuning.shaderDelay * 1000;
    const durationMs = entranceTuning.duration * 1000;
    const mountTime = performance.now();

    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - mountTime;
      let progress = 0;
      if (elapsed >= delayMs) {
        progress = Math.min(1, (elapsed - delayMs) / durationMs);
      }
      const eased = easing(progress);

      // Translate the wrapper toward its layout position
      wrapper.style.left = `${dx * (1 - eased)}px`;
      wrapper.style.top = `${dy * (1 - eased)}px`;

      // Scale the shader by animating its physical width/height
      const currentScale = initialScale + (1 - initialScale) * eased;
      const size = baseSize * currentScale;
      const offset = (baseSize - size) / 2;
      shader.style.width = `${size}px`;
      shader.style.height = `${size}px`;
      shader.style.left = `${offset}px`;
      shader.style.top = `${offset}px`;

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, entranceTuning]);

  if (reducedMotion) {
    return (
      <div className="flex flex-col items-start justify-center gap-10 lg:gap-20 py-30 lg:p-10 max-w-[800px] min-h-full">
        <div className="w-full max-w-[456px] aspect-square">
          <HeroAscii className="w-full h-full" />
        </div>
        <div className="flex flex-col gap-6 lg:gap-10">
          <h2 className="hero-title">
            {TITLE_LINES.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="hero-description">{DESCRIPTION}</p>
        </div>
      </div>
    );
  }

  const charBlurFade = {
    hidden: { opacity: 0, filter: "blur(4px)", y: 10 },
    show: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { duration: TITLE_CHAR_DURATION },
    },
  };

  const wordBlurFade = {
    hidden: { opacity: 0, filter: "blur(6px)" },
    show: {
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: DESCRIPTION_WORD_DURATION },
    },
  };

  const descriptionWords = DESCRIPTION.split(" ");
  const lastWordIndex = descriptionWords.length - 1;

  return (
    <div className="flex flex-col items-start justify-center gap-10 lg:gap-20 py-30 lg:p-10 max-w-[800px] min-h-full">
      <div
        ref={wrapperRef}
        className="w-full max-w-[456px] aspect-square"
        style={{ position: "relative", opacity: 0 }}
      >
        <div
          ref={shaderRef}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
          }}
        >
          <HeroAscii className="w-full h-full" />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:gap-10">
        <motion.h2
          className="hero-title"
          initial="hidden"
          animate="show"
          variants={{
            show: {
              transition: {
                staggerChildren: TITLE_CHAR_STAGGER,
                delayChildren: entranceTuning.titleDelay,
              },
            },
          }}
        >
          {TITLE_LINES.map((line, li) => {
            const words = line.split(" ");
            return (
              <span key={li} className="block">
                {words.map((word, wi) => (
                  <Fragment key={wi}>
                    {wi > 0 && " "}
                    {word.split("").map((c, ci) => (
                      <motion.span
                        key={`${li}-${wi}-${ci}`}
                        variants={charBlurFade}
                        className="inline-block"
                      >
                        {c}
                      </motion.span>
                    ))}
                  </Fragment>
                ))}
              </span>
            );
          })}
        </motion.h2>

        <motion.p
          className="hero-description"
          initial="hidden"
          animate="show"
          variants={{
            show: {
              transition: {
                staggerChildren: DESCRIPTION_WORD_STAGGER,
                delayChildren: entranceTuning.descriptionDelay,
              },
            },
          }}
        >
          {descriptionWords.map((word, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <motion.span
                variants={wordBlurFade}
                className="inline-block"
                onAnimationComplete={
                  i === lastWordIndex ? onEntranceComplete : undefined
                }
              >
                {word}
              </motion.span>
            </Fragment>
          ))}
        </motion.p>
      </div>
    </div>
  );
}
