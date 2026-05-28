"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal, preload } from "react-dom";
import { Drawer } from "vaul";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { useDialKit } from "dialkit";
import { ArrowUpRight } from "./icons";
import type { CaseStudy, CaseSection, GalleryImage } from "@/data/schemas";
import { useCaseStudies } from "@/lib/edit-mode/content-context";
import { Editable } from "./edit-mode/editable";
import { parseBold } from "@/lib/edit-mode/markdown-bold";
import { MediaItem } from "./media-item";
import {
  Lightbox,
  MediaZoomContext,
  useMediaZoom,
  type OpenZoom,
  type ZoomState,
} from "./media-lightbox";

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

  // Lightbox state lives here so we can (a) disable Vaul's outside-dismiss
  // while a lightbox is open via `dismissible={!zoom}`, and (b) render the
  // Lightbox via a portal next to Drawer.Root (not inside Drawer.Content).
  const [zoom, setZoom] = useState<ZoomState | null>(null);
  const openZoom = useCallback<OpenZoom>(
    (item, sourceRect, natural) => setZoom({ item, sourceRect, natural }),
    [],
  );
  const closeZoom = useCallback(() => setZoom(null), []);

  // Esc to close lightbox (only when one is open).
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeZoom();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, closeZoom]);

  // Focus trap via native `inert` on every body sibling except the lightbox root.
  useEffect(() => {
    if (!zoom) return;
    const inerted: Element[] = [];
    for (const el of Array.from(document.body.children)) {
      if (el.hasAttribute("data-lightbox-root")) continue;
      if (!el.hasAttribute("inert")) {
        el.setAttribute("inert", "");
        inerted.push(el);
      }
    }
    return () => inerted.forEach((el) => el.removeAttribute("inert"));
  }, [zoom]);

  const allCaseStudies = useCaseStudies();
  if (!caseStudy) return null;

  const csIndex = allCaseStudies.findIndex((c) => c.slug === caseStudy.slug);
  const csIdBase = `caseStudies.${csIndex}`;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground
      setBackgroundColorOnScale={false}
      direction="bottom"
      onAnimationEnd={onAnimationEnd}
      dismissible={!zoom}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[40px] overflow-clip outline-none"
          style={{ height: "97dvh" }}
          onPointerDownOutside={(e) => {
            // While the lightbox is open, Radix sees pointerdowns on the
            // portaled lightbox as "outside" the drawer content and would
            // dismiss the entire drawer (especially on touch — `dismissible`
            // is a drag-only safeguard in Vaul). Prevent default to block
            // the dismissal; the lightbox handles its own close.
            if (zoom) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (zoom) e.preventDefault();
          }}
        >
        <MediaZoomContext.Provider value={openZoom}>
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
                          <Editable id={`${csIdBase}.company`} value={caseStudy.company} />
                        </h3>
                      </div>

                      {caseStudy.viewSiteUrl ? <ViewSiteButton href={caseStudy.viewSiteUrl} /> : null}
                    </div>

                    <div className="h-px bg-card-text/10 w-full" />
                  </div>

                  <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-11">
                    <MetaBlock
                      idBase={csIdBase}
                      role={caseStudy.role}
                      timeframe={caseStudy.timeframe}
                      scope={caseStudy.scope}
                      platform={caseStudy.platform}
                    />
                    <p className="title-md text-bold text-card-text flex-1 whitespace-pre-wrap">
                      <Editable
                        id={`${csIdBase}.description`}
                        value={caseStudy.description}
                        multiline
                        richText
                        label="Case study description"
                      >
                        {parseBold(caseStudy.description, "text-medium")}
                      </Editable>
                    </p>
                  </div>
                </motion.header>

                {/* Hero — natural aspect ratio (no crop). Fills outer width, height by source aspect.
                    Renders via MediaItem so video kind is supported automatically. */}
                <HeroMedia heroImage={caseStudy.heroImage} />
              </motion.div>

              {/* ── Sections: scroll-triggered ─── */}
              {caseStudy.sections.map((section, i) => (
                <SectionBlock
                  key={i}
                  section={section}
                  idBase={`${csIdBase}.sections.${i}`}
                  scrollRoot={scrollRef}
                  gallerySnapOptions={gallerySnapOptions}
                />
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

          {/* Agentation moved to layout.tsx (so it's visible on the main page,
              not only inside this drawer). DialRoot UI is HIDDEN — useDialKit
              still runs in EmblaGallery and returns tuned defaults driving
              Embla's snap. To play with dial again, mount
              `<div data-vaul-no-drag ...><DialRoot mode="inline" /></div>`
              here inside Drawer.Content (data-vaul-no-drag is needed so Vaul
              doesn't treat clicks as drag/dismiss). */}
        </MediaZoomContext.Provider>
        </Drawer.Content>
      </Drawer.Portal>

      {/* Lightbox lives in its own portal next to (not inside) Drawer.Content
          so its DOM is outside the drawer's clipping container — and so we can
          control Drawer's `dismissible` flag based on zoom state above. */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {zoom && <Lightbox state={zoom} onClose={closeZoom} />}
          </AnimatePresence>,
          document.body,
        )}
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
        <span className="body text-medium text-card-text">View site</span>
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
  idBase: string;
  role: string;
  timeframe: string;
  scope: string;
  platform: string;
}

function MetaBlock({ idBase, role, timeframe, scope, platform }: MetaBlockProps) {
  const items: Array<[string, string, string]> = [
    ["Role", role, "role"],
    ["Timeframe", timeframe, "timeframe"],
    ["Scope", scope, "scope"],
    ["Platform", platform, "platform"],
  ];
  return (
    <dl className="flex flex-col w-full lg:w-[200px] lg:shrink-0">
      {items.map(([label, value, fieldKey], i) => (
        <div
          key={label}
          className={`flex flex-col gap-0.5 py-3 ${
            i === 0 ? "pt-0" : "border-t-2 border-dotted border-card-text/10"
          } ${i === items.length - 1 ? "pb-0" : ""}`}
        >
          <dt className="caption text-card-text text-secondary">{label}</dt>
          <dd className="body text-medium text-card-text">
            <Editable id={`${idBase}.${fieldKey}`} value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ─── Hero media ─── */

function HeroMedia({ heroImage }: { heroImage: GalleryImage }) {
  const onZoom = useMediaZoom() ?? undefined;
  return (
    <motion.div variants={itemVariants}>
      <MediaItem item={heroImage} variant="fullWidth" priority onZoom={onZoom} />
    </motion.div>
  );
}

/* ─── Section ─── */

function SectionBlock({
  section,
  idBase,
  scrollRoot,
  gallerySnapOptions,
}: {
  section: CaseSection;
  idBase: string;
  scrollRoot: React.RefObject<HTMLDivElement | null>;
  gallerySnapOptions: GallerySnapOptions;
}) {
  const onZoom = useMediaZoom() ?? undefined;
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
          <h3 className="title-md text-bold text-card-text">
            <Editable id={`${idBase}.title`} value={section.title} />
          </h3>
          <p className="body text-card-text whitespace-pre-wrap">
            <Editable
              id={`${idBase}.description`}
              value={section.description}
              multiline
              richText
              label="Section description"
            >
              {parseBold(section.description, "text-medium")}
            </Editable>
          </p>
        </div>
      </motion.div>

      {/* Media — full outer width.
          - 1 item → standalone (single full-width block, no carousel).
          - 2+ items → gallery (mobile stack + desktop Embla carousel).
          - 0 items → nothing rendered. */}
      {section.images.length > 0 && (
        <motion.div variants={itemVariants} className="w-full">
          {section.images.length === 1 ? (
            <MediaItem item={section.images[0]} variant="fullWidth" onZoom={onZoom} />
          ) : (
            <SectionGallery items={section.images} snapOptions={gallerySnapOptions} onZoom={onZoom} />
          )}
        </motion.div>
      )}
    </motion.section>
  );
}

/* ─── Gallery ─── */

function SectionGallery({
  items,
  snapOptions,
  onZoom,
}: {
  items: GalleryImage[];
  snapOptions: GallerySnapOptions;
  onZoom?: (item: GalleryImage, sourceRect: DOMRect) => void;
}) {
  return (
    <>
      {/* Mobile: vertical stack */}
      <div className="flex flex-col gap-6 w-full lg:hidden">
        {items.map((m, i) => (
          <MediaItem key={i} item={m} variant="fullWidth" onZoom={onZoom} />
        ))}
      </div>
      {/* Desktop: Embla horizontal carousel with 1200 frame + peek bleed */}
      <div className="hidden lg:block w-full">
        <EmblaGallery items={items} options={snapOptions} onZoom={onZoom} />
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

function EmblaGallery({
  items,
  options,
  onZoom,
}: {
  items: GalleryImage[];
  options: GallerySnapOptions;
  onZoom?: (item: GalleryImage, sourceRect: DOMRect) => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    options,
    [WheelGesturesPlugin({ forceWheelAxis: "x" })],
  );

  // Preload gallery images on mount — prevents flash/glitch during fast
  // skipSnaps wheel scrolling. Videos skip aggressive preload (heavy);
  // <video preload="metadata"> on the element fetches first frame as needed.
  useEffect(() => {
    items.forEach((m) => {
      if (m.kind !== "video") preload(m.src, { as: "image" });
    });
  }, [items]);

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
        {items.map((m, i) => (
          <div key={i} className="shrink-0 h-[680px]">
            <MediaItem item={m} variant="carouselSlot" onZoom={onZoom} />
          </div>
        ))}
      </div>
    </div>
  );
}

