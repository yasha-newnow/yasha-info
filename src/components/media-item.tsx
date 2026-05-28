"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import type { GalleryImage } from "@/data/schemas";

export function MediaItem({
  item,
  variant,
  onZoom,
  priority,
}: {
  item: GalleryImage;
  variant: "fullWidth" | "carouselSlot" | "lightbox";
  onZoom?: (
    item: GalleryImage,
    sourceRect: DOMRect,
    natural?: { width: number; height: number },
  ) => void;
  priority?: boolean;
}) {
  const reduced = useReducedMotion();
  const isVideo = item.kind === "video";

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
        if (mediaEl instanceof HTMLImageElement && mediaEl.naturalWidth > 0) {
          natural = { width: mediaEl.naturalWidth, height: mediaEl.naturalHeight };
        } else if (mediaEl instanceof HTMLVideoElement && mediaEl.videoWidth > 0) {
          natural = { width: mediaEl.videoWidth, height: mediaEl.videoHeight };
        }
        onZoom(item, rect, natural);
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
          src={item.src}
          aria-label={item.alt}
          autoPlay={!reduced}
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
