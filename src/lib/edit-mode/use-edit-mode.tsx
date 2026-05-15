"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ContentFileKey } from "@/data/schemas";
import { saveContent } from "./save-content";

const EDIT_MODE_STORAGE_KEY = "edit-mode-enabled";

export interface PanelTarget {
  fileKey: ContentFileKey;
  fieldPath: string[];
  initialValue: string;
  richText: boolean;
  label?: string;
}

interface EditEntry {
  fileKey: ContentFileKey;
  fieldPath: string[];
  oldValue: unknown;
  newValue: unknown;
  ts: number;
}

interface EditModeContextValue {
  editMode: boolean;
  toggle: () => void;
  panel: PanelTarget | null;
  openPanel: (target: PanelTarget) => void;
  closePanel: () => void;
  stackSize: number;
  pushEdit: (entry: Omit<EditEntry, "ts">) => void;
  undoLast: (
    applyContextEdit: (
      fileKey: ContentFileKey,
      fieldPath: string[],
      value: unknown,
    ) => void,
  ) => Promise<void>;
  resetSession: (
    applyContextEdit: (
      fileKey: ContentFileKey,
      fieldPath: string[],
      value: unknown,
    ) => void,
  ) => Promise<void>;
}

const noop = () => {};
const noopAsync = async () => {};

const EditModeContext = createContext<EditModeContextValue>({
  editMode: false,
  toggle: noop,
  panel: null,
  openPanel: noop,
  closePanel: noop,
  stackSize: 0,
  pushEdit: noop,
  undoLast: noopAsync,
  resetSession: noopAsync,
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  const [panel, setPanel] = useState<PanelTarget | null>(null);
  const [editStack, setEditStack] = useState<EditEntry[]>([]);

  // Restore edit-mode flag after page reload (so refresh-after-save UX is seamless).
  // Inline NODE_ENV check (not a const) so Turbopack dead-code-eliminates the
  // body in prod builds — keeps the storage key out of the client bundle.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    try {
      const saved = window.localStorage.getItem(EDIT_MODE_STORAGE_KEY);
      if (saved === "true") setEditMode(true);
    } catch {
      // ignore — storage may be unavailable
    }
  }, []);

  const toggle = useCallback(() => {
    if (process.env.NODE_ENV === "production") return;
    setEditMode((prev) => {
      const next = !prev;
      // Going OFF with unflushed edits: confirm before clearing the undo
      // stack (intentional "commit-implicit" boundary).
      if (!next && editStack.length > 0) {
        const ok = window.confirm(
          `End edit session? ${editStack.length} edit${editStack.length === 1 ? "" : "s"} will be locked in — you won't be able to undo.`,
        );
        if (!ok) return prev; // stay ON
        setEditStack([]);
        setPanel(null);
      } else if (!next) {
        setPanel(null);
      }
      try {
        window.localStorage.setItem(
          EDIT_MODE_STORAGE_KEY,
          next ? "true" : "false",
        );
      } catch {
        // ignore
      }
      return next;
    });
  }, [editStack.length]);

  const openPanel = useCallback((target: PanelTarget) => {
    if (process.env.NODE_ENV === "production") return;
    setPanel(target);
  }, []);

  const closePanel = useCallback(() => setPanel(null), []);

  const pushEdit = useCallback((entry: Omit<EditEntry, "ts">) => {
    if (process.env.NODE_ENV === "production") return;
    setEditStack((prev) => [...prev, { ...entry, ts: Date.now() }]);
  }, []);

  const undoLast = useCallback<EditModeContextValue["undoLast"]>(
    async (applyContextEdit) => {
      if (process.env.NODE_ENV === "production") return;
      const last = editStack[editStack.length - 1];
      if (!last) return;
      try {
        await saveContent({
          fileKey: last.fileKey,
          fieldPath: last.fieldPath,
          value: last.oldValue,
        });
        applyContextEdit(last.fileKey, last.fieldPath, last.oldValue);
        setEditStack((prev) => prev.slice(0, -1));
      } catch (e) {
        console.error("[edit-mode] undo failed:", e);
      }
    },
    [editStack],
  );

  const resetSession = useCallback<EditModeContextValue["resetSession"]>(
    async (applyContextEdit) => {
      if (process.env.NODE_ENV === "production") return;
      // Replay in reverse — the same field touched multiple times is
      // restored step by step, ending at its session-original value.
      const reversed = [...editStack].reverse();
      for (const entry of reversed) {
        try {
          await saveContent({
            fileKey: entry.fileKey,
            fieldPath: entry.fieldPath,
            value: entry.oldValue,
          });
          applyContextEdit(entry.fileKey, entry.fieldPath, entry.oldValue);
          setEditStack((prev) => prev.slice(0, -1));
        } catch (e) {
          console.error("[edit-mode] reset failed mid-stack:", e);
          return; // leave remaining entries on the stack for retry
        }
      }
    },
    [editStack],
  );

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <EditModeContext.Provider
      value={{
        editMode: isDev && editMode,
        toggle,
        panel: isDev ? panel : null,
        openPanel,
        closePanel,
        stackSize: isDev ? editStack.length : 0,
        pushEdit,
        undoLast,
        resetSession,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
