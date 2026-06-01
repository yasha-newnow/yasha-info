"use client";

import { useEffect, useRef, useState } from "react";
import { useEditMode } from "@/lib/edit-mode/use-edit-mode";
import {
  useApplyContentEdit,
  useCaseStudies,
} from "@/lib/edit-mode/content-context";
import { saveContent } from "@/lib/edit-mode/save-content";
import type { GalleryImage } from "@/data/schemas";

const PANEL_WIDTH = 420;

/* ── Inline helpers (single consumer — no separate module) ───────────── */

// Read intrinsic media dimensions in the browser, so the server needs no image
// library. Rejects non-finite / non-positive sizes — those would serialize to
// null in the JSON and make the whole content file unloadable.
async function readMediaDimensions(
  file: File,
): Promise<{ width: number; height: number; kind: "image" | "video" }> {
  if (file.type.startsWith("video/")) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        const width = v.videoWidth;
        const height = v.videoHeight;
        URL.revokeObjectURL(url);
        if (width > 0 && height > 0) {
          resolve({ width, height, kind: "video" });
        } else {
          reject(new Error("Could not read video dimensions"));
        }
      };
      v.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not load video metadata"));
      };
      v.src = url;
    });
  }

  // createImageBitmap is fastest; fall back to <img> for formats it rejects.
  try {
    const bmp = await createImageBitmap(file);
    const { width, height } = bmp;
    bmp.close();
    if (width > 0 && height > 0) return { width, height, kind: "image" };
  } catch {
    // fall through to <img>
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      if (width > 0 && height > 0) {
        resolve({ width, height, kind: "image" });
      } else {
        reject(new Error("Could not read image dimensions"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
}

async function uploadImage(file: File, slug: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("slug", slug);
  const res = await fetch("/api/upload-image", { method: "POST", body: fd });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    src?: string;
    error?: string;
  };
  if (!res.ok || !data.ok || !data.src) {
    throw new Error(data.error ?? `Upload failed: ${res.status}`);
  }
  return data.src;
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/* ── Panel ───────────────────────────────────────────────────────────── */

export function GalleryEditPanel() {
  // Inline NODE_ENV check (see EditToggleButton) — dead-code-eliminated in prod.
  if (process.env.NODE_ENV === "production") return null;

  const { panel, closePanel, pushEdit } = useEditMode();
  const applyEdit = useApplyContentEdit();
  const caseStudies = useCaseStudies();
  // This panel only handles gallery edits; text edits go to EditSidePanel.
  const galleryPanel = panel?.kind === "gallery" ? panel : null;

  const [items, setItems] = useState<GalleryImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Synchronous single-flight guard (state lags a render; a ref does not), and
  // the server-confirmed array used as the undo `oldValue` + rollback target.
  const busyRef = useRef(false);
  const lastSavedRef = useRef<GalleryImage[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  // One shared hidden <input type=file> drives both Add and Replace. The next
  // pick's destination lives in a ref. Replace targets by `src` (not index)
  // because busyRef is NOT held while the native file dialog is open — a
  // concurrent reorder/remove could shift indices out from under us.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTargetRef = useRef<
    { mode: "append" } | { mode: "replace"; src: string }
  >({ mode: "append" });

  // Hero edits a single GalleryImage OBJECT field, not an array. Internal state
  // stays a length-1 array (so every op reuses the array code), but the value
  // written to disk / context / undo must be unwrapped to the object.
  const single = !!galleryPanel?.single;
  const fileKey = galleryPanel?.fileKey ?? "caseStudies";
  const fieldPath = galleryPanel?.fieldPath ?? [];
  // Used only for nicer uploaded filenames; fieldPath[0] is the case index.
  const slug = galleryPanel
    ? (caseStudies[Number(galleryPanel.fieldPath[0])]?.slug ?? "media")
    : "media";

  // Open/close the native <dialog>. showModal() lifts it into the top layer,
  // escaping the Vaul/Radix focus trap of the drawer it's launched from.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (galleryPanel) {
      if (!el.open) el.showModal();
      // Clone both so the working copy and the server-confirmed baseline are
      // independent of the panel target (and of each other).
      setItems(structuredClone(galleryPanel.images));
      lastSavedRef.current = structuredClone(galleryPanel.images);
      pendingTargetRef.current = { mode: "append" };
      setError(null);
    } else if (el.open) {
      el.close();
    }
  }, [galleryPanel]);

  // Escape handling: the Vaul drawer this panel launches from listens for
  // Escape on `document` in the capture phase and preventDefault()s it — which
  // both closes the drawer AND cancels the native <dialog>'s own Escape-close,
  // leaving the panel stuck open over a closed drawer. A capture-phase listener
  // on `window` runs before any `document` listener (event-tree order, not
  // registration order), so we swallow Escape there. The native <dialog> still
  // closes itself (its default action is no longer prevented), firing onClose.
  useEffect(() => {
    if (!galleryPanel) return;
    const onEscapeCapture = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.stopImmediatePropagation();
    };
    window.addEventListener("keydown", onEscapeCapture, { capture: true });
    return () =>
      window.removeEventListener("keydown", onEscapeCapture, { capture: true });
  }, [galleryPanel]);

  // Single write path. Optimistic local update by the caller, then persist;
  // on failure, roll the panel back to the server-confirmed array.
  async function persist(next: GalleryImage[]) {
    const prev = lastSavedRef.current;
    // Unwrap to the single object for hero. MUST be applied to ALL egress
    // points — including pushEdit's oldValue/newValue, since undoLast/
    // resetSession replay those verbatim; an array replayed into the heroImage
    // object field would fail Zod and 500 the next load.
    const wire = (a: GalleryImage[]) => (single ? a[0] : a);
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      await saveContent({ fileKey, fieldPath, value: wire(next) });
      applyEdit(fileKey, fieldPath, wire(next)); // live page update, no refresh
      pushEdit({
        fileKey,
        fieldPath,
        oldValue: wire(prev),
        newValue: wire(next),
      }); // Cmd+Z
      lastSavedRef.current = next;
    } catch (e) {
      setError(errMsg(e));
      setItems(prev);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function reorder(from: number, to: number) {
    if (busyRef.current || to < 0 || to >= items.length) return;
    const next = items.slice();
    [next[from], next[to]] = [next[to], next[from]];
    setItems(next);
    void persist(next);
  }

  function remove(i: number) {
    if (busyRef.current) return;
    const next = items.filter((_, idx) => idx !== i);
    setItems(next);
    void persist(next);
  }

  // alt edits update locally on every keystroke; only persist (once) on blur.
  function setAlt(i: number, alt: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, alt } : it)));
  }
  function commitAlt() {
    if (busyRef.current) return;
    // Single-flight guarantees no reorder/remove can be mid-write here, so
    // `items` differs from the server baseline only by alt text — persisting
    // the whole array is equivalent to persisting just the alt change.
    if (JSON.stringify(items) !== JSON.stringify(lastSavedRef.current)) {
      void persist(items);
    }
  }

  // Open the OS file picker for a given destination (append or replace-by-src).
  function pickFor(target: { mode: "append" } | { mode: "replace"; src: string }) {
    if (busyRef.current) return;
    pendingTargetRef.current = target;
    fileInputRef.current?.click();
  }

  // Single handler for both Add and Replace. Holds the single-flight lock across
  // the async read+upload, then funnels into the shared `persist` write path.
  async function applyFile(file: File) {
    if (busyRef.current) return;
    const target = pendingTargetRef.current;
    // For replace, confirm the target still exists BEFORE uploading — otherwise
    // a vanished row would leave an orphaned file on disk. Match by `src`
    // identity (indices may have shifted while the dialog was open).
    if (target.mode === "replace" && !items.some((it) => it.src === target.src)) {
      setError("That item no longer exists — nothing was replaced.");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError(null);
    let media: Omit<GalleryImage, "alt">;
    try {
      const { width, height, kind } = await readMediaDimensions(file);
      const src = await uploadImage(file, slug); // authoritative src
      media = { src, width, height, kind };
    } catch (e) {
      setError(errMsg(e));
      busyRef.current = false;
      setBusy(false);
      return;
    }
    const next: GalleryImage[] =
      target.mode === "append"
        ? [...items, { ...media, alt: "" }]
        : items.map((it) =>
            it.src === target.src ? { ...it, ...media } : it,
          ); // keep alt + position
    setItems(next);
    await persist(next);
  }

  const btn: React.CSSProperties = {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#f5f5f5",
    borderRadius: 6,
    cursor: busy ? "not-allowed" : "pointer",
    fontSize: 13,
    padding: "4px 8px",
    opacity: busy ? 0.5 : 1,
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={galleryPanel?.label ?? "Edit gallery"}
      onClose={closePanel}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: "auto",
        margin: 0,
        width: PANEL_WIDTH,
        height: "100vh",
        maxHeight: "100vh",
        padding: 0,
        border: "none",
        background: "#0a0a0a",
        color: "#f5f5f5",
        boxShadow: "-12px 0 32px rgba(0,0,0,0.5)",
        display: galleryPanel ? "flex" : "none",
        flexDirection: "column",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: 14,
      }}
    >
      {galleryPanel && (
        <>
          <header
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <strong style={{ fontSize: 14, fontWeight: 600 }}>
                {galleryPanel.label ?? "Edit media"}
              </strong>
              <span
                style={{
                  fontSize: 11,
                  opacity: 0.5,
                  fontFamily: "ui-monospace, monospace",
                }}
              >
                {galleryPanel.fileKey}.{galleryPanel.fieldPath.join(".")}
                {!single && (
                  <>
                    {" "}
                    · {items.length} item{items.length === 1 ? "" : "s"}
                  </>
                )}
              </span>
            </div>
            <button type="button" onClick={closePanel} aria-label="Close panel" style={btn}>
              Esc
            </button>
          </header>

          <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
            {items.length === 0 && (
              <p style={{ opacity: 0.5, fontSize: 13 }}>
                No media yet. Add an image or video below.
              </p>
            )}
            {items.map((item, i) => (
              <div
                key={`${item.src}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 48,
                    flexShrink: 0,
                    background: "#1a1a1a",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  {item.kind === "video" ? (
                    <video
                      src={item.src}
                      muted
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.src}
                      alt={item.alt}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
                <input
                  value={item.alt}
                  placeholder="alt text"
                  disabled={busy}
                  onChange={(e) => setAlt(i, e.target.value)}
                  onBlur={commitAlt}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 6,
                    color: "#f5f5f5",
                    fontSize: 12,
                    padding: "6px 8px",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => pickFor({ mode: "replace", src: item.src })}
                  disabled={busy}
                  aria-label="Replace"
                  style={btn}
                >
                  Replace
                </button>
                {!single && (
                  <>
                    <button
                      type="button"
                      onClick={() => reorder(i, i - 1)}
                      disabled={busy || i === 0}
                      aria-label="Move up"
                      style={{ ...btn, opacity: busy || i === 0 ? 0.3 : 1 }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => reorder(i, i + 1)}
                      disabled={busy || i === items.length - 1}
                      aria-label="Move down"
                      style={{ ...btn, opacity: busy || i === items.length - 1 ? 0.3 : 1 }}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      disabled={busy}
                      aria-label="Remove"
                      style={{ ...btn, borderColor: "rgba(239,68,68,0.4)", color: "#fca5a5" }}
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* One hidden input drives both Add and Replace; pendingTargetRef
              decides the destination. */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void applyFile(file);
              e.target.value = ""; // allow re-picking the same file
            }}
          />

          {!single && (
            <footer
              style={{
                padding: "12px 20px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => pickFor({ mode: "append" })}
                disabled={busy}
                style={{
                  ...btn,
                  flex: 1,
                  padding: "10px 14px",
                  fontWeight: 600,
                  borderStyle: "dashed",
                }}
              >
                + Add image / video
              </button>
              {busy && (
                <span style={{ fontSize: 11, opacity: 0.6 }}>working…</span>
              )}
            </footer>
          )}

          {error && (
            <div
              style={{
                padding: "10px 20px",
                background: "rgba(239,68,68,0.12)",
                color: "#fca5a5",
                borderTop: "1px solid rgba(239,68,68,0.3)",
                fontSize: 12,
                maxHeight: 120,
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              {error}
            </div>
          )}
        </>
      )}
    </dialog>
  );
}
