import { z } from "zod";
import { writeContentField } from "@/lib/edit-mode/write-content";

const RequestSchema = z.object({
  fileKey: z.enum(["caseStudies", "caseCards", "about"]),
  fieldPath: z.array(z.string()),
  value: z.unknown(),
});

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Forbidden", { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.message },
      { status: 400 },
    );
  }

  try {
    await writeContentField(parsed.data);
    return Response.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to write content";
    console.error("[api/content] write failed:", err);
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
