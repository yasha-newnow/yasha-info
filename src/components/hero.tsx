"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { HeroAscii } from "./hero-ascii";

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
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderControls = useAnimation();
  const didAnimateRef = useRef(false);

  useLayoutEffect(() => {
    if (reducedMotion || didAnimateRef.current) return;
    const el = shaderRef.current;
    if (!el) return;
    didAnimateRef.current = true;

    const r = el.getBoundingClientRect();
    const dx = window.innerWidth / 2 - (r.left + r.width / 2);
    const dy = window.innerHeight / 2 - (r.top + r.height / 2);

    shaderControls.set({
      x: dx,
      y: dy,
      scale: entranceTuning.initialScale,
      opacity: 1,
    });
    requestAnimationFrame(() => {
      shaderControls.start({
        x: 0,
        y: 0,
        scale: 1,
        transition: {
          duration: entranceTuning.duration,
          ease: ENTRANCE_EASINGS[entranceTuning.easing],
          delay: entranceTuning.shaderDelay,
        },
      });
    });
  }, [reducedMotion, shaderControls, entranceTuning]);

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
      <motion.div
        ref={shaderRef}
        animate={shaderControls}
        initial={false}
        className="w-full max-w-[456px] aspect-square will-change-transform"
        style={{ transformOrigin: "center", opacity: 0 }}
      >
        <HeroAscii className="w-full h-full" />
      </motion.div>

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
