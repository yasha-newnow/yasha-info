"use client";

import { useCallback, useState } from "react";
import type { ContentFileKey } from "@/data/schemas";
import { saveContent } from "./save-content";
import { useApplyContentEdit } from "./content-context";

interface UseEditableContentArgs {
  fileKey: ContentFileKey;
  fieldPath: string[];
}

interface UseEditableContentResult {
  saving: boolean;
  error: string | null;
  save: (value: string) => Promise<boolean>;
  clearError: () => void;
}

export function useEditableContent({
  fileKey,
  fieldPath,
}: UseEditableContentArgs): UseEditableContentResult {
  const applyEdit = useApplyContentEdit();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathKey = fieldPath.join(".");

  const save = useCallback(
    async (value: string): Promise<boolean> => {
      const segments = pathKey.length > 0 ? pathKey.split(".") : [];
      setSaving(true);
      setError(null);
      try {
        await saveContent({ fileKey, fieldPath: segments, value });
        // Update the in-memory context so consumers re-render with the new
        // value. We deliberately do NOT call router.refresh() — that would
        // trigger a Server Component re-render and reset Vaul drawer state.
        applyEdit(fileKey, segments, value);
        return true;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Save failed";
        setError(message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fileKey, pathKey, applyEdit],
  );

  const clearError = useCallback(() => setError(null), []);

  return { saving, error, save, clearError };
}
