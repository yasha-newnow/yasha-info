"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
  type MotionStyle,
} from "framer-motion";
import { preload } from "react-dom";
import {
  useCaseCards,
  useCaseStudies,
  useCaseStudyBySlug,
} from "@/lib/edit-mode/content-context";
import { useEditMode } from "@/lib/edit-mode/use-edit-mode";
import { sections } from "@/data/navigation";
import type { CaseCard } from "@/data/schemas";
import { ProjectCard } from "./project-card";
import { SectionHeader } from "./section-header";
import { ProjectSheet } from "./project-sheet";

/* ─── Scroll-stack tuning (responsive, swapped via matchMedia) ───
   The cards are positioned absolutely inside ONE pinned container (title +
   cards in single sticky child). At p=0 each card sits at its natural list
   position (card i at translateY = i × SPACING_PX); as scroll advances, all
   cards rise up 1:1 with scroll until card i "arrives" (translateY=0) =
   front. After that, depth-driven fan offset + scale + frost kicks in.
   Numbers are animation parameters, finalized in visual-qa. */
type StackConsts = {
  SCALE_STEP: number; // scale lost per depth level
  MAX_VISIBLE: number; // deck shows front + (MAX_VISIBLE-1) behind, rest gone
  MIN_SCALE: number;
  /** Scroll-pixels per card transition. = card_h + INTER_GAP. Viewport-
   *  independent so behavior is consistent across screen sizes. */
  SPACING_PX: number;
  /** Cards-area height inside the pinned container. Pinned container's
   *  total height is computed from CARD_H + paddings — replaces the
   *  earlier `h-[100svh]` which produced variable empty space below the
   *  card. Use clamp-max on desktop (the responsive card may render
   *  shorter on narrow widths — leftover stays ≤56px inside cards-area,
   *  not in the section-to-ABOUT gap). */
  CARD_H: number;
  /** SectionHeader h2 rendered height (responsive font-size). Measured:
   *  76 desktop / 56 mobile. Used in pinned_h calc. */
  H2_HEIGHT: number;
  /** SectionHeader's mb-N (40 mobile / 64 desktop) for pinned-container
   *  height accounting. SectionHeader markup unchanged. */
  TITLE_MB: number;
  /** Extra flex-gap on pinned-container (gap-4=16 mobile / gap-0 desktop)
   *  so total title↔card distance = mb + gap = 56 mobile / 64 desktop. */
  PINNED_FLEX_GAP: number;
};

const DESKTOP: StackConsts = {
  SCALE_STEP: 0.07,
  MAX_VISIBLE: 5,
  MIN_SCALE: 0.7,
  SPACING_PX: 850, // card_h ≈ 752 + INTER_GAP 100
  CARD_H: 752, // ProjectCardDesktop clamp-max
  H2_HEIGHT: 76,
  TITLE_MB: 64, // SectionHeader's lg:mb-16
  PINNED_FLEX_GAP: 0, // desktop: no extra gap (mb-16 alone = 64)
};

const MOBILE: StackConsts = {
  SCALE_STEP: 0.06,
  MAX_VISIBLE: 5,
  MIN_SCALE: 0.74,
  SPACING_PX: 700, // card_h ≈ 600 + INTER_GAP 100
  CARD_H: 600, // ProjectCardMobile fixed
  H2_HEIGHT: 56,
  TITLE_MB: 40, // SectionHeader's mb-10
  PINNED_FLEX_GAP: 16, // mobile: gap-4 brings total title↔card to 56
};

/* Tapered vertical offsets: gaps between consecutive cards shrink with depth
   (16/11/7/4 px) → cumulative upward offset, clamped beyond depth 4. */
const OFFSET_STEPS = [0, 16, 27, 34, 38] as const;
function offsetFor(d: number): number {
  if (d <= 0) return 0;
  const max = OFFSET_STEPS.length - 1; // 4
  if (d >= max) return OFFSET_STEPS[max]; // 38
  const lo = Math.floor(d);
  return (
    OFFSET_STEPS[lo] + (d - lo) * (OFFSET_STEPS[lo + 1] - OFFSET_STEPS[lo])
  );
}

/* Frosted-recede tuning (QA-tunable). FRONT_SHARP: a card stays fully sharp
   (zero blur/tint) until it is this far behind the front, then blur/tint grow
   CONTINUOUSLY from 0 (no pop). Raised to 0.75 — the card now stays sharp
   until the next card has almost fully taken the front (depth ≈ 0.75 of the
   way from "front" to "one card behind"); frost engages late and visibly. */
const FRONT_SHARP = 0.75; // stays sharp until this far behind front
const BLUR_MAX = 20; // px at the deepest visible card (peak)
const TINT_MAX = 0.42; // white veil alpha at the deepest visible card

/* HOLD-zone: after the fan has fully formed (last card became front) the
   scroll runway extends by HOLD_PX where depths are FROZEN (formP saturates
   at 1). The fan reads as a stable kadr-portret before the section exits.
   100px ≈ one wheel-tick of scroll on a typical mouse. */
const HOLD_PX = 100;

/** Mounted-gated matchMedia → typed constants (the hero-ascii.tsx pattern). */
function useResponsiveStackConsts(): StackConsts {
  const [consts, setConsts] = useState<StackConsts>(DESKTOP);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 1023px)");
    const apply = () => setConsts(m.matches ? MOBILE : DESKTOP);
    apply();
    m.addEventListener("change", apply);
    return () => m.removeEventListener("change", apply);
  }, []);
  return consts;
}

function prefetchHero(src: string) {
  preload(src, { as: "image" });
}

type CardHandlers = {
  onClick?: () => void;
  onPrefetch?: () => void;
};

/* ─── One card in the scroll-stack ───
   ALL cards are absolute-positioned inside ONE pinned container (no per-card
   sticky blocks). At p=0, card `i` sits at its natural list position
   (translateY = i × SPACING_PX, where SPACING_PX is a fixed-pixel constant
   independent of viewport). As scroll advances, every card rises up 1:1 with
   scroll; when card `i` reaches translateY=0 it has "arrived" at the front
   slot (just below the title with a fixed 64px flex-gap). After arrival, the
   depth-based fan transform applies: scale↓, offsetFor(depth) pushes UP,
   frost+tint engage at depth ≥ FRONT_SHARP. */

function StackedCard({
  card,
  index,
  count,
  progress,
  consts,
  handlers,
}: {
  card: CaseCard;
  index: number;
  count: number;
  progress: MotionValue<number>;
  consts: StackConsts;
  handlers: CardHandlers;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // delta = formP*(N-1) - i. delta>0 = receded behind front (depth);
  // delta<0 = still waiting below in natural list (waitDistance).
  // FAN_END = scrollRange before HOLD: SPACING*(N-1) / (SPACING*(N-1)+HOLD).
  // Min(1, ...) clamps formP to 1 during the HOLD zone (depths frozen).
  const delta = useTransform(progress, (p) => {
    const scrollRange = consts.SPACING_PX * (count - 1);
    const fanEnd = scrollRange / (scrollRange + HOLD_PX);
    const formP = Math.min(1, p / fanEnd);
    return formP * (count - 1) - index;
  });
  const depth = useTransform(delta, (d) => Math.max(0, d));
  const waitDistance = useTransform(delta, (d) => Math.max(0, -d));

  const scale = useTransform(depth, (d) =>
    d > 0 ? Math.max(consts.MIN_SCALE, 1 - d * consts.SCALE_STEP) : 1,
  );
  // translateY = waitDistance * SPACING_PX (pushes DOWN to natural list slot)
  //            − offsetFor(depth) (pushes UP for fan offset). Mutually
  //            exclusive: one or the other is non-zero (never both).
  const ty = useTransform([waitDistance, depth], ([w, d]) => {
    return (w as number) * consts.SPACING_PX - offsetFor(d as number);
  });
  // Full opacity while clearly visible, then a short 1→0 fade so the buried
  // tail dissolves. Depth legibility = scale + tapered offset + content blur
  // + white frost veil (below) — not a gradual opacity fade.
  const opacity = useTransform(depth, (d) => {
    const fadeStart = consts.MAX_VISIBLE - 1;
    if (d < fadeStart) return 1;
    return Math.max(0, Math.min(1, 1 - (d - fadeStart)));
  });

  // Frosted recede: blur the card's OWN content + a white veil, ramping with
  // depth. FRONT_SHARP keeps the front/incoming card mathematically at blur 0
  // (this is the fix to the earlier "the active card blurred" objection).
  const ramp = (d: number) =>
    Math.min(
      Math.max(0, (d - FRONT_SHARP) / (consts.MAX_VISIBLE - FRONT_SHARP)),
      1,
    );
  // Continuous from 0 at the threshold (no pop): at d=FRONT_SHARP ramp=0 →
  // blur(0px) which is seamless with "none", then grows smoothly to BLUR_MAX.
  const contentFilter = useTransform(depth, (d) => {
    if (d < FRONT_SHARP) return "none";
    return `blur(${(ramp(d) * BLUR_MAX).toFixed(2)}px)`;
  });
  // Tint grows linearly so the frost veil reads steadily as glass.
  const cardTint = useTransform(depth, (d) =>
    d < FRONT_SHARP ? 0 : +(ramp(d) * TINT_MAX).toFixed(3),
  );

  const transform = useMotionTemplate`translate3d(0, ${ty}px, 0) scale(${scale})`;

  // Expose depth for QA/diagnostics.
  useMotionValueEvent(depth, "change", (d) => {
    if (ref.current) ref.current.dataset.depth = d.toFixed(2);
  });

  const style = {
    transform,
    opacity,
    zIndex: index, // later cards paint over earlier ones
    transformOrigin: "top center",
    willChange: "transform, opacity",
    "--card-content-filter": contentFilter,
    "--card-tint": cardTint,
  } as MotionStyle;

  // Absolute-positioned inside cards-area (top:0 = natural slot of card 0 =
  // just below title with fixed 64px flex-gap). translateY from formula puts
  // each card at its current scroll-state position (list slot or fan offset).
  return (
    <motion.div
      ref={ref}
      data-stack-index={index}
      className="absolute inset-x-0 mx-auto w-full max-w-[1280px]"
      style={{ ...style, top: 0 } as MotionStyle}
    >
      <ProjectCard
        card={card}
        cardIndex={index}
        stacked
        onClick={handlers.onClick}
        onPrefetch={handlers.onPrefetch}
      />
    </motion.div>
  );
}

/* ─── Works section ─── */

export function WorksSection({
  scrollContainer,
}: {
  scrollContainer: RefObject<HTMLElement | null>;
}) {
  const caseCards = useCaseCards();
  const caseStudies = useCaseStudies();
  const reducedMotion = useReducedMotion();
  const { editMode } = useEditMode();
  const consts = useResponsiveStackConsts();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeStudy = useCaseStudyBySlug(activeSlug);

  const studyBySlug = (slug: string | null) =>
    slug ? (caseStudies.find((s) => s.slug === slug) ?? null) : null;

  const handlersFor = (card: CaseCard): CardHandlers => {
    const study = studyBySlug(card.caseSlug);
    if (!study) return {};
    return {
      onClick: () => {
        setActiveSlug(study.slug);
        setSheetOpen(true);
      },
      onPrefetch: () => prefetchHero(study.heroImage.src),
    };
  };

  const sheet = (
    <ProjectSheet
      caseStudy={activeStudy}
      open={sheetOpen}
      onOpenChange={setSheetOpen}
      onAnimationEnd={(isOpen) => {
        if (!isOpen) setActiveSlug(null);
      }}
    />
  );

  // Pre-mount / reduced-motion / edit-mode: original static, fully readable
  // and editable list. One shared branch.
  if (!mounted || reducedMotion || editMode) {
    return (
      <section
        id="works"
        className="flex flex-col px-0 lg:px-10 pt-10 lg:pt-20 pb-10 scroll-mt-[88px] lg:scroll-mt-0"
      >
        <div>
          <SectionHeader title={sections[0].title} tag={sections[0].tag} />
        </div>
        <div className="flex flex-col gap-6 lg:gap-8">
          {caseCards.map((card, i) => (
            <ProjectCard
              key={card.slug}
              card={card}
              cardIndex={i}
              {...handlersFor(card)}
            />
          ))}
        </div>
        {sheet}
      </section>
    );
  }

  return (
    <WorksStack
      caseCards={caseCards}
      consts={consts}
      scrollContainer={scrollContainer}
      handlersFor={handlersFor}
      sheet={sheet}
    />
  );
}

/* Separate component so its scroll hooks live on a tree that only exists
   post-mount, while WorksSection's hook list stays stable. */
function WorksStack({
  caseCards,
  consts,
  scrollContainer,
  handlersFor,
  sheet,
}: {
  caseCards: CaseCard[];
  consts: StackConsts;
  scrollContainer: RefObject<HTMLElement | null>;
  handlersFor: (card: CaseCard) => CardHandlers;
  sheet: React.ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const count = caseCards.length;

  // Section's scroll-runway = SPACING_PX*(N-1) [list→fan animation]
  // + HOLD_PX [final frozen-fan period].
  const scrollRunway = consts.SPACING_PX * (count - 1) + HOLD_PX;

  // Pinned-container height = pt + h2 + mb + flex-gap + CARD_H + pb.
  // Replaces the earlier `h-[100svh] lg:h-[100dvh]` so the bottom-void
  // between last card and ABOUT is bounded by CARD_H (px-based, not vh).
  const PINNED_PT = 56;
  const PINNED_PB = 80;
  const pinnedH =
    PINNED_PT + consts.H2_HEIGHT + consts.TITLE_MB +
    consts.PINNED_FLEX_GAP + consts.CARD_H + PINNED_PB;

  // useScroll offset = ["start start", `end ${pinnedH}px`] — p=1 aligns with
  // the EXACT scrollTop where sticky un-pins (= section.bottom − pinnedH).
  // Default `end end` would give p=1 at section.bottom − vh, leaving
  // (vh − pinnedH) px of "ghost runway" past p=1 on viewports where
  // vh > pinnedH (mobile), inflating the visible gap to ABOUT.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: scrollContainer,
    offset: ["start start", `end ${pinnedH}px`],
  });

  // Expose true progress for QA/diagnostics on the section itself (which
  // also carries `data-card-count` — matching existing test selectors that
  // expect a single element with both attributes + the full scroll-runway
  // height, used to compute scroll-progress positions).
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (sectionRef.current) sectionRef.current.dataset.p = v.toFixed(3);
  });

  return (
    <section
      id="works"
      ref={sectionRef}
      data-card-count={count}
      className="relative px-0 lg:px-10 scroll-mt-[88px] lg:scroll-mt-0"
      style={{ height: `${scrollRunway + pinnedH}px` }}
    >
      {/* ONE pinned container — title + cards in a single block.
          • Sticky `top-[-80px] lg:top-0` keeps the visual pin at viewport y=0
            on both: mobile `<main>` has pt-20 (80px), so −80 compensates;
            desktop main has lg:pt-0 so top:0 pins at y=0.
          • Explicit pinnedH (px) replaces `h-[100svh]` so the bottom-void is
            bounded by CARD_H, not viewport height (predictable on all sizes).
          • flex flex-col pt-[56px] pb-[80px] gap-4 lg:gap-0 = title at y≈56
            from viewport top, 56/64 px gap to first card (mobile/desktop),
            80px buffer below the last card before section bottom.
          • NO overflow-hidden — cards extending below the pinned area on tall
            viewports stay rendered (consistent on desktop and mobile). */}
      <div
        className="sticky top-[-80px] lg:top-0 flex flex-col pt-[56px] pb-[80px] gap-4 lg:gap-0"
        style={{ height: `${pinnedH}px`, background: "var(--accent)" }}
      >
        <SectionHeader title={sections[0].title} tag={sections[0].tag} />

        {/* Cards-area — absolute-positioned cards anchored at top:0.
            flex-1 fills the remaining pinned-container space = exactly CARD_H
            (since pinnedH already accounts for it). */}
        <div className="relative w-full flex-1">
          {caseCards.map((card, i) => (
            <StackedCard
              key={card.slug}
              card={card}
              index={i}
              count={count}
              progress={scrollYProgress}
              consts={consts}
              handlers={handlersFor(card)}
            />
          ))}
        </div>
      </div>

      {sheet}
    </section>
  );
}
