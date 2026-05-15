import { promises as fs } from "fs";
import path from "path";
import {
  CONTENT_FILE_REGISTRY,
  type ContentFileKey,
} from "@/data/schemas";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface WriteContentArgs {
  fileKey: ContentFileKey;
  fieldPath: string[];
  value: unknown;
}

export async function writeContentField({
  fileKey,
  fieldPath,
  value,
}: WriteContentArgs): Promise<void> {
  const entry = CONTENT_FILE_REGISTRY[fileKey];
  if (!entry) {
    throw new Error(`Unknown fileKey: ${fileKey}`);
  }
  const filePath = path.join(CONTENT_DIR, entry.fileName);

  const raw = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(raw) as Record<string, unknown>;

  // The top-level data object uses the fileKey as its root field
  // (e.g. {"caseStudies": [...]} or {"caseCards": [...]} or about's flat object).
  // For caseStudies/caseCards, fieldPath starts with the array index.
  // For about, fieldPath starts with a top-level key like "bio" or "howText".
  setByPath(data, fileKey === "about" ? fieldPath : [fileKey, ...fieldPath], value);

  // Validate AFTER mutation — catches both bad input and corrupt initial state.
  entry.schema.parse(data);

  // Atomic write: temp file + rename (POSIX rename is atomic on the same fs).
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  await fs.rename(tempPath, filePath);
}

function setByPath(
  root: Record<string, unknown>,
  segments: string[],
  value: unknown,
): void {
  if (segments.length === 0) {
    throw new Error("Field path cannot be empty");
  }

  let cur: unknown = root;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    if (cur === null || typeof cur !== "object") {
      throw new Error(`Path stopped at non-object before segment "${seg}"`);
    }
    const next = (cur as Record<string, unknown>)[seg];
    if (next === undefined) {
      throw new Error(`Path segment not found: "${seg}"`);
    }
    cur = next;
  }

  const lastSeg = segments[segments.length - 1];
  if (cur === null || typeof cur !== "object") {
    throw new Error(`Cannot set final segment on non-object: "${lastSeg}"`);
  }
  const objCur = cur as Record<string, unknown>;
  if (!(lastSeg in objCur)) {
    throw new Error(
      `Path segment does not exist (in-place edits only): "${lastSeg}"`,
    );
  }
  objCur[lastSeg] = value;
}
