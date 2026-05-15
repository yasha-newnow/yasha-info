"use client";

import { useCallback, useRef, type ReactNode } from "react";
import type { ContentFileKey } from "@/data/schemas";
import { useEditMode } from "@/lib/edit-mode/use-edit-mode";
import { useEditableContent } from "@/lib/edit-mode/use-editable-content";

interface EditableProps {
  id: string;
  value: string;
  multiline?: boolean;
  richText?: boolean;
  label?: string;
  className?: string;
  children?: ReactNode;
}

function splitId(id: string): { fileKey: ContentFileKey; fieldPath: string[] } {
  const [head, ...rest] = id.split(".");
  if (head !== "caseStudies" && head !== "caseCards" && head !== "about") {
    throw new Error(`Editable id must start with a known fileKey, got "${head}"`);
  }
  return { fileKey: head, fieldPath: rest };
}

export function Editable({
  id,
  value,
  multiline = false,
  richText = false,
  label,
  className,
  children,
}: EditableProps) {
  const { editMode, openPanel, pushEdit } = useEditMode();
  const { fileKey, fieldPath } = splitId(id);
  const { save, saving, error } = useEditableContent({ fileKey, fieldPath });
  const elRef = useRef<HTMLSpanElement>(null);

  const handleBlur = useCallback(async () => {
    const next = elRef.current?.textContent ?? "";
    if (next === value) return;
    const ok = await save(next);
    if (ok) pushEdit({ fileKey, fieldPath, oldValue: value, newValue: next });
  }, [save, value, pushEdit, fileKey, fieldPath]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        elRef.current?.blur();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (elRef.current) elRef.current.textContent = value;
        elRef.current?.blur();
      }
    },
    [value],
  );

  if (!editMode) {
    // Suppress hydration mismatch warnings for the editable surface. In dev,
    // the dev server may cache a stale module of the data JSON between SSR and
    // client renders, so server text can lag behind client text after a save.
    // We want React to keep the SSR HTML, then quietly update on the first
    // client render — instead of regenerating the subtree (which would
    // cascade and remount sibling stateful components like the hero canvas).
    return (
      <span suppressHydrationWarning data-edit-id={id}>
        {children ?? value}
      </span>
    );
  }

  if (multiline) {
    return (
      <span
        className={className}
        data-edit-id={id}
        data-edit-multiline="true"
        suppressHydrationWarning
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          openPanel({
            fileKey,
            fieldPath,
            initialValue: value,
            richText,
            label,
          });
        }}
        style={{
          outline: error ? "2px dashed #ef4444" : "2px dashed #6366f1",
          outlineOffset: "2px",
          cursor: "pointer",
          opacity: saving ? 0.5 : 1,
          borderRadius: "2px",
        }}
      >
        {children ?? value}
      </span>
    );
  }

  return (
    <span
      ref={elRef}
      className={className}
      data-edit-id={id}
      contentEditable
      suppressContentEditableWarning
      suppressHydrationWarning
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{
        outline: error ? "2px dashed #ef4444" : "2px dashed #6366f1",
        outlineOffset: "2px",
        cursor: "text",
        opacity: saving ? 0.5 : 1,
        borderRadius: "2px",
      }}
    >
      {value}
    </span>
  );
}
