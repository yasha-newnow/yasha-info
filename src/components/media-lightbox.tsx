"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MediaItem } from "./media-item";
import type { GalleryImage } from "@/data/schemas";

export type ZoomState = {
  item: GalleryImage;
  sourceRect: DOMRect;
  /** Natural dimensions of the actual element clicked (img.naturalWidth,
   * video.videoWidth). Falls back to item.width/height if unavailable. */
  natural?: { width: number; height: number };
  /** Playback position (seconds) of the source video at click time, so the
   * lightbox video resumes from it instead of restarting at 0. Undefined for
   * images / paused-at-start. */
  startTime?: number;
  /** Data-URL snapshot of the source video's current frame, shown under the
   * lightbox video during the open-morph so frame T is visible from the first
   * paint (no frame-0 flash). Undefined for images / when capture failed. */
  poster?: string;
};
export type OpenZoom = (
  item: GalleryImage,
  sourceRect: DOMRect,
  natural?: { width: number; height: number },
  startTime?: number,
  poster?: string,
) => void;

const Ctx = createContext<OpenZoom | null>(null);
export const MediaZoomContext = Ctx;
export const useMediaZoom = () => useContext(Ctx);

// Shadow value matches the case-card hover state (see project-card.tsx).
const FRAME_SHADOW = "0px 20px 40px rgba(18, 20, 25, 0.07)";

export function Lightbox({
  state,
  onClose,
}: {
  state: ZoomState;
  onClose: () => void;
}) {
  const { item, sourceRect, natural, startTime, poster } = state;
  const reduced = useReducedMotion();

  // Anti-flash: while a poster (frame T) is shown, keep the fresh lightbox
  // <video> hidden until it has actually seeked to T, then reveal it. Without a
  // poster (image, or capture failed) there's nothing to gate → ready from start.
  const [videoReady, setVideoReady] = useState(false);

  // Frame sizing must match the *true* aspect ratio of the rendered media,
  // not the JSON metadata (which can lag behind on-disk files). Start with
  // whatever we got at click time (item.width/height or natural from the
  // source <img>), then refine once the lightbox's own <img>/<video> loads
  // and reports its real intrinsic dimensions.
  const [naturalDims, setNaturalDims] = useState(() => ({
    w: natural?.width ?? item.width,
    h: natural?.height ?? item.height,
  }));
  const mediaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = mediaRef.current;
    if (!root) return;
    // Select the REAL media element — explicitly skip the decorative freeze-frame
    // poster (`aria-hidden` <img>). Otherwise the poster is matched first and the
    // video is never found → it isn't seeked and the gate reveals immediately.
    const el = root.querySelector("video, img:not([aria-hidden])") as
      | HTMLImageElement
      | HTMLVideoElement
      | null;
    if (!el) return;
    const update = () => {
      if (el instanceof HTMLImageElement && el.naturalWidth > 0) {
        setNaturalDims({ w: el.naturalWidth, h: el.naturalHeight });
      } else if (el instanceof HTMLVideoElement && el.videoWidth > 0) {
        setNaturalDims({ w: el.videoWidth, h: el.videoHeight });
        // Resume from the gallery video's position (videoWidth > 0 ⇒ metadata
        // loaded ⇒ currentTime is settable). Clamp below duration so a click
        // near the very end doesn't loop-wrap back to ~0; skip if already close.
        if (startTime) {
          const dur = el.duration;
          const target =
            Number.isFinite(dur) && dur > 0 ? Math.min(startTime, dur - 0.05) : startTime;
          if (Math.abs(el.currentTime - target) > 0.05) el.currentTime = target;
        }
      }
    };
    update();
    const loadEvent = el instanceof HTMLImageElement ? "load" : "loadedmetadata";
    el.addEventListener(loadEvent, update);

    // Reveal the poster-gated video once it actually displays frame T. Idempotent
    // + several fallbacks so the video can never stay stuck invisible.
    let revealed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setVideoReady(true);
    };
    if (!poster || !(el instanceof HTMLVideoElement) || !startTime || startTime < 0.05 || reduced) {
      // Nothing to gate: image, no captured poster, nothing to seek, or reduced
      // motion (morph is instant) — show immediately.
      reveal();
    } else {
      // Reveal ONLY after the seek to T completes (`seeked` ⇒ frame T decoded &
      // ready). NOT on `canplay`: for a cached video it fires on the start frame
      // (0) before the seek lands, which would reveal frame 0 and defeat the gate.
      // The timeout is a last-resort net so the video can never stay hidden
      // forever if `seeked` somehow never fires (cached seek is well under it).
      el.addEventListener("seeked", reveal, { once: true });
      timer = setTimeout(reveal, 400);
    }

    return () => {
      el.removeEventListener(loadEvent, update);
      el.removeEventListener("seeked", reveal);
      if (timer) clearTimeout(timer);
    };
  }, [item.src, startTime, poster, reduced]);
  const naturalW = naturalDims.w;
  const naturalH = naturalDims.h;

  // Viewport state — updates on resize so frame stays correctly fitted.
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 0,
    h: typeof window !== "undefined" ? window.innerHeight : 0,
  }));
  useEffect(() => {
    const onResize = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Frame target — fit content aspect ratio within viewport-minus-margins,
  // centered. Eliminates the `bg-white` padding around the media.
  const margin = viewport.w >= 768 ? 40 : 20;
  const maxW = Math.max(0, viewport.w - margin * 2);
  const maxH = Math.max(0, viewport.h - margin * 2);
  const contentAspect = naturalW / naturalH;
  const availableAspect = maxW / maxH || 1;

  let frameW: number;
  let frameH: number;
  if (contentAspect > availableAspect) {
    // Content is wider relative to available area → bound by width.
    frameW = maxW;
    frameH = maxW / contentAspect;
  } else {
    // Content is taller relative to available area → bound by height.
    frameH = maxH;
    frameW = maxH * contentAspect;
  }
  // Defensive clamp — never let computed frame exceed viewport-minus-margins.
  frameW = Math.min(frameW, maxW);
  frameH = Math.min(frameH, maxH);
  const frameTop = (viewport.h - frameH) / 2;
  const frameLeft = (viewport.w - frameW) / 2;

  const initialFrame = {
    top: sourceRect.top,
    left: sourceRect.left,
    width: sourceRect.width,
    height: sourceRect.height,
    boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
    opacity: 1,
  };
  const animateFrame = {
    top: frameTop,
    left: frameLeft,
    width: frameW,
    height: frameH,
    boxShadow: FRAME_SHADOW,
    opacity: 1,
  };

  // If the source has scrolled out of view (e.g. drawer was scrolled before
  // opening), morphing back to its rect would push the frame off-screen above
  // the drawer's top edge. In that case fade out from current position instead.
  const sourceInView =
    sourceRect.bottom > 0 && sourceRect.top < viewport.h;
  const exitFrame = sourceInView ? initialFrame : { ...animateFrame, opacity: 0 };

  // The lightbox is portaled to <body>, so it lives OUTSIDE the drawer's own
  // clip (`overflow-clip rounded-t-[40px]`). Without this, the morph frame
  // paints over the drawer's rounded top corners / the strip above it while
  // animating to/from the in-drawer source rect (visible on open and on exit).
  // Clip the morph layer to the drawer's bounds: drawer is `inset-x-0 bottom-0`,
  // `height: 97dvh`, `rounded-t-[40px]` → top inset = 3% of viewport height.
  const drawerClip = `inset(${viewport.h * 0.03}px 0px 0px 0px round 40px 40px 0px 0px)`;

  return (
    // Vaul sets `pointer-events: none` on <body> while the drawer is open.
    // Our lightbox lives in a portal under <body>, so it inherits that
    // value and clicks never reach the close button. Explicit `pointerEvents:
    // "auto"` on the interactive elements overrides that inheritance.
    <div
      data-lightbox-root
      role="dialog"
      aria-modal="true"
      aria-label="Media preview"
      className="fixed inset-0 z-[60]"
      style={{ pointerEvents: "auto" }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.3 }}
        onClick={onClose}
        // Stop pointerdown from reaching Vaul's Radix DismissableLayer at the
        // document level, which would close the entire drawer on touch devices
        // (the dismissible prop is a drag-only safeguard).
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute inset-0 backdrop-blur-[7px] bg-black/20"
        style={{ pointerEvents: "auto" }}
      />

      {/* Clip wrapper — static, sized to the drawer's rounded bounds so the
          morphing frame can never paint outside the drawer. `pointerEvents:
          none` lets clicks "outside" the image still reach the backdrop
          (onClose). Kept separate from the animated frame so framer-motion's
          per-frame writes never touch the clip. */}
      <div
        className="absolute inset-0"
        style={{ clipPath: drawerClip, pointerEvents: "none" }}
      >
        {/* Frame — morphs from source rect to aspect-fitted target rect.
            No background colour: the frame's size is mathematically fit to the
            content's natural aspect, so the media element fills it. A `bg-white`
            previously showed as a 1px white halo around dark images due to
            subpixel rounding — using transparent lets the backdrop blur fill
            any rounding gap instead. */}
        <motion.div
          ref={mediaRef}
          initial={initialFrame}
          animate={animateFrame}
          exit={exitFrame}
          transition={
            reduced
              ? { duration: 0 }
              : { type: "spring", duration: 0.5, bounce: 0 }
          }
          className="absolute rounded-[24px] overflow-hidden"
          style={{ pointerEvents: "auto" }}
        >
          {/* Freeze-frame of the source video at click time. Sits UNDER the
              video and is shown until the video has seeked to T, so the morph
              displays frame T from the first paint (no frame-0 flash). */}
          {poster && !videoReady && (
            <img
              src={poster}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
          )}
          {/* Gate the (fresh, autoplaying) video to opacity 0 until it shows
              frame T. No poster ⇒ nothing to hide behind ⇒ stay visible. */}
          <div
            className={`w-full h-full ${
              videoReady || !poster ? "" : "opacity-0"
            }`}
          >
            <MediaItem item={item} variant="lightbox" />
          </div>
        </motion.div>
      </div>

      {/* Close button — viewport-positioned, exits with the lightbox */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.2 }}
        className="absolute top-4 right-4 z-[1]"
        style={{ pointerEvents: "auto" }}
      >
        <button
          type="button"
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Close preview"
          className="flex items-center justify-center w-12 h-12 rounded-xl cursor-pointer transition-colors duration-300 hover:bg-black/10"
          style={{ pointerEvents: "auto", backdropFilter: "blur(10px)", color: "var(--card-text, #121419)" }}
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 -960 960 960"
            fill="currentColor"
          >
            <path d="M256-192.35 192.35-256l224-224-224-224L256-767.65l224 224 224-224L767.65-704l-224 224 224 224L704-192.35l-224-224-224 224Z" />
          </svg>
        </button>
      </motion.div>
    </div>
  );
}
