"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditMode } from "@/lib/edit-mode/use-edit-mode";
import { useEditableContent } from "@/lib/edit-mode/use-editable-content";
import { parseBold } from "@/lib/edit-mode/markdown-bold";

const PANEL_WIDTH = 420;

function wrapSelection(
  textarea: HTMLTextAreaElement,
  marker: string,
): { next: string; selStart: number; selEnd: number } {
  const value = textarea.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);

  if (selected.length === 0) {
    const inserted = `${marker}${marker}`;
    const next = value.slice(0, start) + inserted + value.slice(end);
    return {
      next,
      selStart: start + marker.length,
      selEnd: start + marker.length,
    };
  }

  const before = value.slice(Math.max(0, start - marker.length), start);
  const after = value.slice(end, end + marker.length);
  if (before === marker && after === marker) {
    const next =
      value.slice(0, start - marker.length) +
      selected +
      value.slice(end + marker.length);
    return {
      next,
      selStart: start - marker.length,
      selEnd: end - marker.length,
    };
  }

  const next =
    value.slice(0, start) + marker + selected + marker + value.slice(end);
  return {
    next,
    selStart: start + marker.length,
    selEnd: end + marker.length,
  };
}

export function EditSidePanel() {
  // Inline NODE_ENV check (see EditToggleButton for rationale) — keeps the
  // panel body out of the production client bundle via dead-code elimination.
  if (process.env.NODE_ENV === "production") return null;
  const { panel, closePanel, pushEdit } = useEditMode();
  const fileKey = panel?.fileKey ?? "about";
  const fieldPath = panel?.fieldPath ?? [];
  const { save, saving, error, clearError } = useEditableContent({
    fileKey,
    fieldPath,
  });
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Open/close the native <dialog>. showModal() puts the element in the
  // browser's top layer — above any other DOM, focus is owned by the dialog,
  // and Vaul/Radix focus traps no longer reach in. Closes via close() or Esc.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (panel) {
      if (!el.open) el.showModal();
      setText(panel.initialValue);
      setSaved(false);
      clearError();
      // Move focus to textarea; browser auto-focuses first focusable, but the
      // close button comes first in DOM, so steer it explicitly.
      requestAnimationFrame(() => textareaRef.current?.focus());
    } else if (el.open) {
      el.close();
    }
  }, [panel, clearError]);

  const handleSave = useCallback(async () => {
    if (!panel) return;
    if (text === panel.initialValue) {
      closePanel();
      return;
    }
    const ok = await save(text);
    if (ok) {
      pushEdit({
        fileKey: panel.fileKey,
        fieldPath: panel.fieldPath,
        oldValue: panel.initialValue,
        newValue: text,
      });
      setSaved(true);
      setTimeout(() => closePanel(), 350);
    }
  }, [panel, text, save, closePanel, pushEdit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void handleSave();
        return;
      }
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "b" &&
        panel?.richText &&
        textareaRef.current
      ) {
        e.preventDefault();
        const { next, selStart, selEnd } = wrapSelection(
          textareaRef.current,
          "**",
        );
        setText(next);
        const el = textareaRef.current;
        requestAnimationFrame(() => {
          el.setSelectionRange(selStart, selEnd);
        });
      }
      // Esc is handled natively by the <dialog> (fires onClose).
    },
    [handleSave, panel?.richText],
  );

  return (
    <dialog
      ref={dialogRef}
      aria-label={panel?.label ?? "Edit content"}
      data-edit-panel
      data-edit-panel-label={panel?.label ?? "Edit content"}
      onClose={closePanel}
      style={{
        // Override native <dialog> centering: pin to right edge as a side panel.
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: "auto",
        margin: 0,
        width: PANEL_WIDTH,
        maxHeight: "100vh",
        height: "100vh",
        padding: 0,
        border: "none",
        background: "#0a0a0a",
        color: "#f5f5f5",
        boxShadow: "-12px 0 32px rgba(0,0,0,0.5)",
        display: panel ? "flex" : "none",
        flexDirection: "column",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: 14,
      }}
    >
      {panel && (
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
                {panel.label ?? "Edit text"}
              </strong>
              <span
                style={{
                  fontSize: 11,
                  opacity: 0.5,
                  fontFamily: "ui-monospace, monospace",
                }}
              >
                {panel.fileKey}.{panel.fieldPath.join(".")}
              </span>
            </div>
            <button
              type="button"
              onClick={closePanel}
              aria-label="Close panel"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#f5f5f5",
                padding: "4px 10px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Esc
            </button>
          </header>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              padding: "16px 20px",
              background: "transparent",
              color: "#f5f5f5",
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: 14,
              lineHeight: 1.6,
              fontFamily:
                "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          />

          {panel.richText && (
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  opacity: 0.5,
                  marginBottom: 8,
                }}
              >
                Preview
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {parseBold(text, "text-medium")}
              </div>
            </div>
          )}

          <footer
            style={{
              padding: "12px 20px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 11, opacity: 0.6 }}>
              {panel.richText ? "Cmd+B bold · " : ""}Cmd+S save · Esc cancel
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={closePanel}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#f5f5f5",
                  padding: "6px 14px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: saved ? "#10b981" : "#6366f1",
                  border: "none",
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: 6,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saved ? "Saved" : saving ? "Saving…" : "Save"}
              </button>
            </div>
          </footer>

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
