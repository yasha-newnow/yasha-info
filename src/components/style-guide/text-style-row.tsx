import { createElement } from "react";
import {
  FONT_VAR_MAP,
  type TextStyleEntry,
  type Variant,
} from "./text-styles";
import { AuditBadge } from "./audit-badge";

function PreviewCell({
  label,
  variant,
  entry,
}: {
  label: string;
  variant: Variant;
  entry: TextStyleEntry;
}) {
  const fontFamily = FONT_VAR_MAP[variant.font] ?? variant.font;
  const previewElement = createElement(
    entry.tag,
    {
      style: {
        fontFamily,
        fontSize: variant.size,
        lineHeight: `${variant.lineHeight}px`,
        fontWeight: variant.weight,
        textTransform: variant.transform ?? "none",
        letterSpacing: variant.letterSpacing ?? "normal",
        margin: 0,
        color: "var(--foreground)",
      },
    },
    entry.sample,
  );

  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-lg min-w-0"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--foreground) 4%, transparent)",
      }}
    >
      <div
        className="flex items-baseline gap-3 font-mono text-xs leading-4"
        style={{ color: "color-mix(in srgb, var(--foreground) 65%, transparent)" }}
      >
        <span
          className="font-tag font-medium uppercase tracking-[0.03em]"
          style={{ fontSize: 11 }}
        >
          {label}
        </span>
        <span>
          {variant.font} · {variant.size}/{variant.lineHeight}/{variant.weight}
          {variant.transform ? " · " + variant.transform : ""}
          {variant.letterSpacing ? " · ls " + variant.letterSpacing : ""}
        </span>
      </div>
      <div className="overflow-x-auto">{previewElement}</div>
    </div>
  );
}

export function TextStyleRow({ entry }: { entry: TextStyleEntry }) {
  return (
    <div
      className="flex flex-col gap-4 p-6 rounded-2xl"
      style={{
        border:
          "1px solid color-mix(in srgb, var(--foreground) 12%, transparent)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="font-sans font-semibold text-xl leading-7">
            {entry.label}
          </div>
          <div
            className="font-mono text-xs leading-4 break-all"
            style={{
              color:
                "color-mix(in srgb, var(--foreground) 65%, transparent)",
            }}
          >
            <span className="opacity-60">className: </span>
            {entry.className ?? "(base CSS — no class)"}
          </div>
          <div
            className="font-mono text-xs leading-4 break-all"
            style={{
              color:
                "color-mix(in srgb, var(--foreground) 50%, transparent)",
            }}
          >
            <span className="opacity-60">source: </span>
            {entry.source}
          </div>
        </div>
        {entry.audit.length > 0 && (
          <div className="flex flex-col gap-1 items-end shrink-0">
            {entry.audit.map((a) => (
              <AuditBadge key={a} note={a} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile + Desktop side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PreviewCell label="Mobile" variant={entry.mobile} entry={entry} />
        <PreviewCell label="Desktop (lg:)" variant={entry.desktop} entry={entry} />
      </div>
    </div>
  );
}
