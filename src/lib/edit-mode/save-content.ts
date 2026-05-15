import type { ContentFileKey } from "@/data/schemas";

interface SaveContentArgs {
  fileKey: ContentFileKey;
  fieldPath: string[];
  value: unknown;
}

export async function saveContent({
  fileKey,
  fieldPath,
  value,
}: SaveContentArgs): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Edit mode is disabled in production");
  }

  const res = await fetch("/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileKey, fieldPath, value }),
  });

  if (!res.ok) {
    let message = `Save failed: ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore — keep status-only message
    }
    throw new Error(message);
  }
}
