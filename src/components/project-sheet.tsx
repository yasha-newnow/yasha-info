"use client";

import { useEffect, useRef } from "react";
import { Drawer } from "vaul";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { preload } from "react-dom";
import { DialRoot, useDialKit } from "dialkit";
import { Agentation } from "agentation";
import { ArrowUpRight } from "./icons";
import type { CaseStudy, CaseSection, GalleryImage } from "@/data/case-studies";

const ITEM_DURATION = 0.35;
const STAGGER = 0.12;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 4, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: ITEM_DURATION, ease: "easeOut" as const },
  },
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
};

interface ProjectSheetProps {
  caseStudy: CaseStudy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnimationEnd?: (open: boolean) => void;
}

export function ProjectSheet({
  caseStudy,
  open,
  onOpenChange,
  onAnimationEnd,
}: ProjectSheetProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const gallerySnapOptions = useGallerySnapDial();

  if (!caseStudy) return null;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground
      setBackgroundColorOnScale={false}
      direction="bottom"
      onAnimationEnd={onAnimationEnd}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[40px] overflow-clip outline-none"
          style={{ height: "97dvh" }}
        >
          {/* a11y */}
          <Drawer.Title className="sr-only">{caseStudy.company}</Drawer.Title>
          <Drawer.Description className="sr-only">
            {caseStudy.role} · {caseStudy.timeframe}
          </Drawer.Description>

          {/* Scrollable content. Top spacing matches Paper (40 mobile / 120 desktop).
              overflow-x-clip prevents Embla horizontal overflow from creating a scroll context. */}
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto overflow-x-clip pt-10 lg:pt-[120px] pb-10 lg:pb-[120px]"
          >
            {/* Outer wrapper: 1200 max, centered, mobile-only side padding. */}
            <div className="mx-auto w-full max-w-[1200px] px-6 lg:px-0 flex flex-col gap-12 lg:gap-20">
              {/* ── Above-the-fold: stagger on open ─── */}
              <motion.div
                className="contents"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Header block: row + divider + meta+desc as one Paper F96-0 unit.
                    Internal gap-16 (64px) = Paper divider→meta gap. */}
                <motion.header
                  variants={itemVariants}
                  className="w-full lg:max-w-[800px] lg:mx-auto flex flex-col gap-10 lg:gap-16"
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between gap-6 h-10">
                      <div className="flex items-center gap-4 min-w-0">
                        <Image
                          src={caseStudy.logoSrc}
                          alt={`${caseStudy.company} logo`}
                          width={40}
                          height={40}
                          className="size-10 rounded-xl shrink-0"
                        />
                        <h3 className="title-lg text-card-text truncate">
                          {caseStudy.company}
                        </h3>
                      </div>

                      {caseStudy.viewSiteUrl ? <ViewSiteButton href={caseStudy.viewSiteUrl} /> : null}
                    </div>

                    <div className="h-px bg-card-text/10 w-full" />
                  </div>

                  <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-11">
                    <MetaBlock
                      role={caseStudy.role}
                      timeframe={caseStudy.timeframe}
                      scope={caseStudy.scope}
                      platform={caseStudy.platform}
                    />
                    <p className="title-md text-bold text-card-text flex-1">
                      {caseStudy.description}
                    </p>
                  </div>
                </motion.header>

                {/* Hero — natural aspect ratio (no crop). Fills outer width, height by source aspect. */}
                <motion.div
                  variants={itemVariants}
                  className="w-full rounded-[24px] overflow-hidden"
                >
                  <Image
                    src={caseStudy.heroImage.src}
                    alt={caseStudy.heroImage.alt}
                    width={caseStudy.heroImage.width}
                    height={caseStudy.heroImage.height}
                    className="w-full h-auto block"
                    loading="eager"
                    fetchPriority="high"
                    sizes="(max-width: 1024px) 100vw, 1200px"
                  />
                </motion.div>
              </motion.div>

              {/* ── Sections: scroll-triggered ─── */}
              {caseStudy.sections.map((section, i) => (
                <SectionBlock key={i} section={section} scrollRoot={scrollRef} gallerySnapOptions={gallerySnapOptions} />
              ))}
            </div>
          </div>

          {/* Drag handle — visible always; absolute over scroller.
              Vaul Handle has built-in 44×44 [data-vaul-handle-hitarea] for touch. */}
          <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-3 pointer-events-none">
            <Drawer.Handle className="pointer-events-auto cursor-grab active:cursor-grabbing" />
          </div>

          {/* Close button — desktop only */}
          <div className="hidden lg:block absolute top-10 right-10 z-20">
            <Drawer.Close
              aria-label="Close"
              className="flex items-center justify-center w-12 h-12 rounded-xl cursor-pointer transition-colors duration-300 hover:bg-card-text/5"
              style={{ backdropFilter: "blur(10px)", color: "var(--card-text)" }}
            >
              <svg aria-hidden="true" width="24" height="24" viewBox="0 -960 960 960" fill="currentColor">
                <path d="M256-192.35 192.35-256l224-224-224-224L256-767.65l224 224 224-224L767.65-704l-224 224 224 224L704-192.35l-224-224-224 224Z" />
              </svg>
            </Drawer.Close>
          </div>

          {/* Dev tools — mounted INSIDE Drawer.Content so clicks don't trigger
              Vaul's outside-click close. `data-vaul-no-drag` blocks drag-detection.

              DialRoot UI is currently HIDDEN — useDialKit still runs in EmblaGallery
              and returns the tuned defaults that drive Embla's snap behavior.
              To play with dial again, uncomment `<DialRoot mode="inline" />` below. */}
          {process.env.NODE_ENV === "development" && (
            <div data-vaul-no-drag className="absolute top-4 right-4 z-30 max-h-[calc(100%-32px)] overflow-auto pointer-events-auto">
              {/* <DialRoot mode="inline" /> */}
              <Agentation />
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/* ─── View Site button ─── */

function ViewSiteButton({ href }: { href: string }) {
  return (
    <>
      {/* Desktop: label + icon */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-vaul-no-drag
        className="hidden lg:flex items-center gap-2 px-3 py-3 rounded-lg transition-colors duration-150 hover:bg-card-text/10 active:bg-card-text/15"
        style={{ color: "var(--card-text)" }}
      >
        <span className="body--medium text-card-text">View site</span>
        <ArrowUpRight size={20} />
      </a>

      {/* Mobile: icon only */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View site"
        data-vaul-no-drag
        className="lg:hidden flex items-center justify-center size-12 rounded-xl transition-colors duration-150 active:bg-card-text/10"
        style={{ backdropFilter: "blur(10px)", color: "var(--card-text)" }}
      >
        <ArrowUpRight size={20} />
      </a>
    </>
  );
}

/* ─── Meta block ─── */

interface MetaBlockProps {
  role: string;
  timeframe: string;
  scope: string;
  platform: string;
}

function MetaBlock({ role, timeframe, scope, platform }: MetaBlockProps) {
  const items: Array<[string, string]> = [
    ["Role", role],
    ["Timeframe", timeframe],
    ["Scope", scope],
    ["Platform", platform],
  ];
  return (
    <dl className="flex flex-col w-full lg:w-[200px] lg:shrink-0">
      {items.map(([label, value], i) => (
        <div
          key={label}
          className={`flex flex-col gap-0.5 py-3 ${
            i === 0 ? "pt-0" : "border-t-2 border-dotted border-card-text/10"
          } ${i === items.length - 1 ? "pb-0" : ""}`}
        >
          <dt className="caption text-card-text text-secondary">{label}</dt>
          <dd className="body--medium text-card-text">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ─── Section ─── */

function SectionBlock({
  section,
  scrollRoot,
  gallerySnapOptions,
}: {
  section: CaseSection;
  scrollRoot: React.RefObject<HTMLDivElement | null>;
  gallerySnapOptions: GallerySnapOptions;
}) {
  return (
    <motion.section
      className="w-full flex flex-col gap-12 lg:gap-20"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ root: scrollRoot, once: true, margin: "0px 0px -80px 0px" }}
    >
      {/* Title block — text content; centered on lg.
          Spacings per Paper: divider→title 64px, title→description 24px. */}
      <motion.div
        variants={itemVariants}
        className="w-full lg:max-w-[800px] lg:mx-auto flex flex-col gap-10 lg:gap-16"
      >
        <div className="h-px bg-card-text/10 w-full" />
        <div className="flex flex-col gap-6">
          <h3 className="title-md text-bold text-card-text">{section.title}</h3>
          <p className="body text-card-text">{section.description}</p>
        </div>
      </motion.div>

      {/* Gallery — full outer width */}
      {section.images.length > 0 && (
        <motion.div variants={itemVariants} className="w-full">
          <SectionGallery images={section.images} snapOptions={gallerySnapOptions} />
        </motion.div>
      )}
    </motion.section>
  );
}

/* ─── Gallery ─── */

function SectionGallery({ images, snapOptions }: { images: GalleryImage[]; snapOptions: GallerySnapOptions }) {
  return (
    <>
      {/* Mobile: vertical stack */}
      <div className="flex flex-col gap-6 w-full lg:hidden">
        {images.map((img, i) => (
          <GalleryImageItem key={i} img={img} mobile />
        ))}
      </div>
      {/* Desktop: Embla horizontal carousel with 1200 frame + peek bleed */}
      <div className="hidden lg:block w-full">
        <EmblaGallery images={images} options={snapOptions} />
      </div>
    </>
  );
}

type GallerySnapOptions = {
  align: "start" | "center" | "end";
  containScroll: "trimSnaps" | "keepSnaps";
  slidesToScroll: number;
  dragFree: boolean;
  duration: number;
  skipSnaps: boolean;
  dragThreshold: number;
};

// Registers a single DialKit panel for ALL gallery instances. Call once at the top
// of ProjectSheet; pass the resolved options down to each EmblaGallery via prop.
function useGallerySnapDial(): GallerySnapOptions {
  const dial = useDialKit(
    "Gallery snap",
    {
      // Tuned defaults locked in after dialkit play session.
      duration: [15, 5, 60, 1],
      dragThreshold: [0, 0, 30, 1],
      dragFree: false,
      skipSnaps: true,
      align: {
        type: "select" as const,
        options: ["start", "center", "end"],
        default: "center",
      },
      containScroll: {
        type: "select" as const,
        options: ["trimSnaps", "keepSnaps"],
        default: "keepSnaps",
      },
      slidesToScroll: [1, 1, 4, 1],
      reload: { type: "action" as const, label: "Reload page" },
    },
    {
      onAction: (path) => {
        if (path === "reload") window.location.reload();
      },
    },
  );
  return {
    align: dial.align as "start" | "center" | "end",
    containScroll: dial.containScroll as "trimSnaps" | "keepSnaps",
    slidesToScroll: dial.slidesToScroll,
    dragFree: dial.dragFree,
    duration: dial.duration,
    skipSnaps: dial.skipSnaps,
    dragThreshold: dial.dragThreshold,
  };
}

function EmblaGallery({ images, options }: { images: GalleryImage[]; options: GallerySnapOptions }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    options,
    [WheelGesturesPlugin({ forceWheelAxis: "x" })],
  );

  // Preload all gallery images on mount — prevents flash/glitch during fast
  // skipSnaps wheel scrolling (Embla can fly past 3+ slides in 200ms; if images
  // weren't yet loaded by native lazy IntersectionObserver, you see blanks).
  useEffect(() => {
    images.forEach((img) => preload(img.src, { as: "image" }));
  }, [images]);

  // Live re-init when dial knobs change (dev only).
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit(options);
  }, [emblaApi, options]);

  return (
    // Embla viewport: 1200 frame, overflow visible so items peek beyond right edge.
    // Drawer.Content overflow-clip handles viewport-edge clipping.
    <div
      ref={emblaRef}
      data-vaul-no-drag
      className="w-full overflow-visible cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex gap-6 touch-pan-y">
        {images.map((img, i) => (
          <div key={i} className="shrink-0 h-[680px]">
            <GalleryImageItem img={img} />
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryImageItem({ img, mobile }: { img: GalleryImage; mobile?: boolean }) {
  return (
    <div className={mobile ? "rounded-[24px] overflow-hidden w-full" : "rounded-[24px] overflow-hidden h-full"}>
      <Image
        src={img.src}
        alt={img.alt}
        width={img.width}
        height={img.height}
        // Mobile = vertical stack with native lazy load (works fine — slow vertical scroll).
        // Desktop = Embla carousel; eager + preload (in EmblaGallery) prevents flash on fast wheel/skipSnaps.
        loading={mobile ? "lazy" : "eager"}
        sizes={mobile ? "100vw" : "(max-width: 1024px) 100vw, auto"}
        draggable={false}
        className={
          mobile
            ? "w-full h-auto block pointer-events-none"
            : "w-auto h-full object-cover block pointer-events-none"
        }
      />
    </div>
  );
}
