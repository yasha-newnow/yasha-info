import { promises as fs } from "fs";
import path from "path";

// Dev-only media upload for the in-browser gallery editor. Writes the uploaded
// file into public/images/projects/ (the real production path) and returns the
// authoritative public src. Dimensions are read in the BROWSER before upload,
// so the server needs no image library.

const PROJECTS_DIR = path.join(process.cwd(), "public", "images", "projects");

// Whitelist by extension — keeps arbitrary files out of public/. Dev-only and
// single-user, so .svg (which can embed scripts) is acceptable here; it would
// warrant sanitizing if this route ever ran outside local development.
const ALLOWED_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".mp4",
  ".webm",
]);

// Lowercase, strip to [a-z0-9-], collapse and trim dashes.
function sanitize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

// Write to the first free name: base.ext, base-1.ext, base-2.ext, …
// The "wx" flag fails if the file already exists, so there is no
// check-then-write TOCTOU race.
async function writeUnique(
  base: string,
  ext: string,
  buf: Buffer,
): Promise<string> {
  for (let i = 0; i < 1000; i++) {
    const name = i === 0 ? `${base}${ext}` : `${base}-${i}${ext}`;
    try {
      await fs.writeFile(path.join(PROJECTS_DIR, name), buf, { flag: "wx" });
      return name;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "EEXIST") continue;
      throw err;
    }
  }
  throw new Error("Could not find a free filename after 1000 attempts");
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Forbidden", { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json(
      { ok: false, error: "Invalid form data" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json(
      { ok: false, error: "Missing file" },
      { status: 400 },
    );
  }

  const ext = extOf(file.name);
  if (!ALLOWED_EXT.has(ext)) {
    return Response.json(
      { ok: false, error: `Unsupported file type: ${ext || "(none)"}` },
      { status: 400 },
    );
  }

  const slug = sanitize(String(form.get("slug") ?? ""));
  const original = sanitize(file.name.slice(0, file.name.length - ext.length));
  // Fall back to "media" when sanitizing leaves nothing (e.g. a cyrillic name).
  const base = [slug, original].filter(Boolean).join("-") || "media";

  try {
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    const name = await writeUnique(base, ext, buf);
    return Response.json({ ok: true, src: `/images/projects/${name}` });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to write file";
    console.error("[api/upload-image] write failed:", err);
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
