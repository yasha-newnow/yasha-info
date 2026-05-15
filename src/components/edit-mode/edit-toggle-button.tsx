"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditMode } from "@/lib/edit-mode/use-edit-mode";
import { useApplyContentEdit } from "@/lib/edit-mode/content-context";

const STORAGE_KEY = "edit-toggle-button-position";
const DRAG_THRESHOLD = 4;
const MARGIN = 16;
const TOOLBAR_HEIGHT = 36;
const TOOLBAR_WIDTH_ESTIMATE = 320;

interface Position {
  x: number;
  y: number;
}

function loadPosition(): Position | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Position;
    if (typeof parsed.x !== "number" || typeof parsed.y !== "number")
      return null;
    return parsed;
  } catch {
    return null;
  }
}

function clampToViewport(pos: Position): Position {
  if (typeof window === "undefined") return pos;
  const maxX = window.innerWidth - TOOLBAR_WIDTH_ESTIMATE - MARGIN;
  const maxY = window.innerHeight - TOOLBAR_HEIGHT - MARGIN;
  return {
    x: Math.max(MARGIN, Math.min(pos.x, maxX)),
    y: Math.max(MARGIN, Math.min(pos.y, maxY)),
  };
}

function defaultPosition(): Position {
  if (typeof window === "undefined") return { x: 16, y: 16 };
  return {
    x: window.innerWidth - TOOLBAR_WIDTH_ESTIMATE - MARGIN,
    y: window.innerHeight - TOOLBAR_HEIGHT - MARGIN,
  };
}

export function EditToggleButton() {
  // Inline check so Turbopack DCE-elides the whole body in prod builds.
  if (process.env.NODE_ENV === "production") return null;
  const { editMode, toggle, stackSize, undoLast, resetSession } = useEditMode();
  const applyContextEdit = useApplyContentEdit();
  const [position, setPosition] = useState<Position | null>(null);
  const draggingRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    const saved = loadPosition();
    setPosition(clampToViewport(saved ?? defaultPosition()));
  }, []);

  useEffect(() => {
    if (!position) return;
    const onResize = () => setPosition((p) => (p ? clampToViewport(p) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [position]);

  // Cmd+Z = undo last session edit. Only active while edit mode is ON.
  useEffect(() => {
    if (!editMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        // Don't hijack Cmd+Z inside the side-panel textarea or any other
        // input — only intercept when no editable element is focused.
        const active = document.activeElement;
        const isInput =
          active instanceof HTMLTextAreaElement ||
          active instanceof HTMLInputElement ||
          (active instanceof HTMLElement && active.isContentEditable);
        if (isInput) return;
        e.preventDefault();
        void undoLast(applyContextEdit);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editMode, undoLast, applyContextEdit]);

  // Drag handlers — attached only to the toggle pill so the Undo / Reset
  // buttons remain plain-click without drag mode confusion.
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!position) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      draggingRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: position.x,
        originY: position.y,
        moved: false,
      };
    },
    [position],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = draggingRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (!d.moved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
      d.moved = true;
      const next = clampToViewport({ x: d.originX + dx, y: d.originY + dy });
      setPosition(next);
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = draggingRef.current;
      draggingRef.current = null;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      if (!d) return;
      if (d.moved && position) {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
        } catch {
          // ignore quota errors
        }
        return;
      }
      toggle();
    },
    [position, toggle],
  );

  if (!position) return null;

  const buttonBase: React.CSSProperties = {
    height: TOOLBAR_HEIGHT,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#ffffff",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.2,
    boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
    userSelect: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        zIndex: 99999,
        display: "inline-flex",
        gap: 8,
      }}
    >
      <button
        type="button"
        data-edit-toggle
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        aria-label={editMode ? "Disable edit mode" : "Enable edit mode"}
        style={{
          ...buttonBase,
          background: editMode ? "#10b981" : "#111111",
          cursor: draggingRef.current?.moved ? "grabbing" : "grab",
          touchAction: "none",
        }}
      >
        {editMode ? "✓ Done editing" : "✏️ Edit"}
      </button>

      {editMode && stackSize > 0 && (
        <>
          <button
            type="button"
            data-edit-undo
            onClick={() => void undoLast(applyContextEdit)}
            aria-label={`Undo last edit (${stackSize} on stack)`}
            style={{ ...buttonBase, background: "#1f2937" }}
          >
            ↶ Undo ({stackSize})
          </button>
          <button
            type="button"
            data-edit-reset
            onClick={() => void resetSession(applyContextEdit)}
            aria-label={`Reset session — revert ${stackSize} edits`}
            style={{ ...buttonBase, background: "#3f1f1f" }}
          >
            ↺ Reset ({stackSize} edit{stackSize === 1 ? "" : "s"})
          </button>
        </>
      )}
    </div>
  );
}
