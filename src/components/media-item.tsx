"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useInView, useReducedMotion } from "framer-motion";
import type { GalleryImage } from "@/data/schemas";

export function MediaItem({
  item,
  variant,
  onZoom,
  priority,
  poster,
  autoPlay,
  scrollRoot,
}: {
  item: GalleryImage;
  variant: "fullWidth" | "carouselSlot" | "lightbox";
  onZoom?: (
    item: GalleryImage,
    sourceRect: DOMRect,
    natural?: { width: number; height: number },
    startTime?: number,
    poster?: string,
  ) => void;
  priority?: boolean;
  /** Freeze-frame shown by the browser's native <video poster> until the real
   * frame is painted (lightbox resume — avoids a frame-0 flash). */
  poster?: string;
  /** Override autoplay (lightbox passes false so the poster persists until we
   * seek to T and call play()). Defaults to !reduced. */
  autoPlay?: boolean;
  /** Scroll container the gallery lives in — used as the IntersectionObserver
   * root so off-screen videos pause (they leave this box while still inside the
   * window, so a viewport root would never fire). */
  scrollRoot?: React.RefObject<HTMLDivElement | null>;
}) {
  const reduced = useReducedMotion();
  const isVideo = item.kind === "video";
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pause off-screen gallery videos so they don't all decode at once. The
  // lightbox drives its own playback (variant "lightbox"), so it is excluded;
  // reduced-motion never autoplays. Edge-triggered on the in-view flip — never
  // pauses while visible, so the click-to-zoom currentTime capture stays live.
  const gateVideo = isVideo && variant !== "lightbox" && (autoPlay ?? !reduced);
  const inView = useInView(wrapperRef, { root: scrollRoot, margin: "200px" });
  useEffect(() => {
    if (!gateVideo) return;
    const v = videoRef.current;
    if (!v) return;
    if (inView) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [gateVideo, inView]);

  const mediaClass =
    variant === "carouselSlot"
      ? "w-auto h-full object-cover block"
      : variant === "lightbox"
      ? "w-full h-full object-contain block"
      : "w-full h-auto block";

  const wrapClass =
    variant === "carouselSlot"
      ? "rounded-[24px] overflow-hidden h-full"
      : variant === "lightbox"
      ? "w-full h-full"
      : "rounded-[24px] overflow-hidden w-full";

  // Cursor — carousel uses grab (drag affordance); standalone/hero/mobile-stack
  // use zoom-in. Explicit per-variant — not inherited from Embla viewport,
  // because <img> UA styles can override inherited cursor unpredictably.
  const cursorClass = !onZoom
    ? ""
    : variant === "carouselSlot"
      ? "cursor-grab active:cursor-grabbing"
      : "cursor-zoom-in";

  const handleClick = onZoom
    ? (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mediaEl = e.currentTarget.querySelector("img, video") as
          | HTMLImageElement
          | HTMLVideoElement
          | null;
        let natural: { width: number; height: number } | undefined;
        // Capture the live playback position so the lightbox can resume from it
        // instead of restarting from 0. Read for any video (even before
        // metadata loads `videoWidth`); harmless 0 for images.
        let startTime: number | undefined;
        // Snapshot the exact current frame as a data URL. The lightbox shows it
        // under its (initially hidden) <video> so the morph displays frame T from
        // the first paint — no frame-0 flash while the fresh video seeks. Videos
        // are same-origin (/images/...), so the canvas isn't tainted; the
        // try/catch degrades gracefully (no poster ⇒ lightbox skips the gate).
        let poster: string | undefined;
        if (mediaEl instanceof HTMLImageElement && mediaEl.naturalWidth > 0) {
          natural = { width: mediaEl.naturalWidth, height: mediaEl.naturalHeight };
        } else if (mediaEl instanceof HTMLVideoElement) {
          startTime = mediaEl.currentTime;
          if (mediaEl.videoWidth > 0) {
            natural = { width: mediaEl.videoWidth, height: mediaEl.videoHeight };
            try {
              const c = document.createElement("canvas");
              c.width = mediaEl.videoWidth;
              c.height = mediaEl.videoHeight;
              const ctx = c.getContext("2d");
              if (ctx) {
                ctx.drawImage(mediaEl, 0, 0, c.width, c.height);
                poster = c.toDataURL("image/jpeg", 0.85);
              }
            } catch {
              // taint / decode failure → no poster, lightbox falls back gracefully
            }
          }
        }
        onZoom(item, rect, natural, startTime, poster);
      }
    : undefined;

  // Tooltip — only in carousel slot (mobile stack = touch usually, standalone/
  // hero already convey "click to zoom" via cursor). Custom follow-cursor
  // implementation: setTimeout(1000) on hover, hide on leave/mousedown.
  const tooltipEnabled = variant === "carouselSlot" && !!onZoom;
  const [tt, setTt] = useState<{ x: number; y: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  // Latest cursor position — updated on every mousemove so when the show-timer
  // fires the tooltip appears AT THE CURRENT cursor (not at the stale
  // mouseenter position captured 500ms earlier).
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Cleanup timer on unmount — prevents setState on unmounted component
  // when user clicks a media (lightbox opens) while tooltip timer pending.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const canHover =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches;

  const onMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tooltipEnabled || !canHover) return;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setTt({ ...lastPosRef.current });
      timerRef.current = null;
    }, 500);
  };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    if (tt) setTt({ x: e.clientX, y: e.clientY });
  };
  const cancelTooltip = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setTt(null);
  };

  return (
    <div
      ref={wrapperRef}
      className={`${wrapClass} ${cursorClass}`}
      onClick={handleClick}
      onMouseEnter={tooltipEnabled ? onMouseEnter : undefined}
      onMouseMove={tooltipEnabled ? onMouseMove : undefined}
      onMouseLeave={tooltipEnabled ? cancelTooltip : undefined}
      onMouseDown={tooltipEnabled ? cancelTooltip : undefined}
      role={handleClick ? "button" : undefined}
      tabIndex={handleClick ? 0 : undefined}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          src={item.src}
          aria-label={item.alt}
          poster={poster}
          autoPlay={autoPlay ?? !reduced}
          muted
          loop
          playsInline
          preload={priority ? "auto" : "metadata"}
          draggable={false}
          style={{ aspectRatio: `${item.width} / ${item.height}` }}
          className={mediaClass}
        />
      ) : (
        <Image
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          loading={priority || variant === "carouselSlot" ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          sizes={
            variant === "carouselSlot"
              ? "(max-width: 1024px) 100vw, auto"
              : "(max-width: 1024px) 100vw, 1200px"
          }
          draggable={false}
          className={mediaClass}
        />
      )}
      {tt && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed pointer-events-none z-[70] text-[10px] font-mono uppercase tracking-wide bg-black/85 text-white px-2 py-1 rounded backdrop-blur-sm"
            style={{ left: tt.x + 12, top: tt.y + 12 }}
          >
            Click to zoom
          </div>,
          document.body,
        )}
    </div>
  );
}
