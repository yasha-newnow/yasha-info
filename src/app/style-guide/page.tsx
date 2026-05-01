import { Section } from "@/components/style-guide/section";
import { AuditBadge } from "@/components/style-guide/audit-badge";
import { IconGrid } from "@/components/style-guide/icon-grid";
import { ColorSwatches } from "@/components/style-guide/color-swatches";
import { SpacingScale } from "@/components/style-guide/spacing-scale";
import { textStyles } from "@/components/style-guide/text-styles";
import { TextStyleRow } from "@/components/style-guide/text-style-row";

const FONTS = [
  {
    name: "Inter Tight",
    cssVar: "--font-sans",
    role: "body, UI, default",
    weights: "400 / 500 / 600 / 700",
    sample: "The quick brown fox jumps over the lazy dog.",
    fontFamily: "var(--font-sans)",
  },
  {
    name: "Druk Cond Super",
    cssVar: "--font-heading",
    role: "section H2 (display)",
    weights: "1000",
    sample: "WORKS & BITS",
    fontFamily: "var(--font-heading)",
  },
  {
    name: "Stick No Bills",
    cssVar: "--font-tag",
    role: "tags / captions",
    weights: "500 / 600",
    sample: "& BITS — TAG STYLE",
    fontFamily: "var(--font-tag)",
  },
  {
    name: "Homemade Apple",
    cssVar: "--font-handwritten",
    role: "handwritten accent (sidebar name)",
    weights: "400",
    sample: "Yasha Petrunin",
    fontFamily: "var(--font-handwritten)",
  },
  {
    name: "Roboto Mono",
    cssVar: "--font-mono",
    role: "monospace (currently unused)",
    weights: "400",
    sample: "const greeting = 'hello';",
    fontFamily: "var(--font-mono)",
  },
];

const MAX_WIDTHS = [
  { value: 1280, where: "src/app/page.tsx:31 — main wrapper" },
  { value: 1200, where: "src/components/project-sheet.tsx:61 — sheet content" },
  { value: 1200, where: "src/components/project-card.tsx:26 — card outer" },
  { value: 1003, where: "src/components/hero.tsx:77 — hero description" },
];

export default function StyleGuidePage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--accent)", color: "var(--foreground)" }}
    >
      <div className="max-w-[1800px] mx-auto px-6 lg:px-10 py-10 lg:py-16">
        {/* Header */}
        <header className="flex flex-col gap-3 pb-8">
          <div className="font-tag font-medium text-xs uppercase tracking-[0.03em] opacity-60">
            /style-guide • not indexed, not linked
          </div>
          <h1 className="font-sans font-bold text-5xl lg:text-[64px] leading-tight lg:leading-[72px]">
            Style guide
          </h1>
          <p className="font-sans text-lg leading-7 max-w-3xl opacity-70">
            Catalog of every typography style, icon, color and spacing
            currently in use across the portfolio. Mobile and desktop frames
            below are real iframes — they render the actual classNames from the
            codebase, with their own viewport, so <code>lg:</code> rules behave
            authentically.
          </p>
        </header>

        {/* Fonts */}
        <Section
          title="Fonts"
          description="5 font families wired through globals.css @theme variables."
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {FONTS.map((f) => (
              <div
                key={f.name}
                className="flex flex-col gap-3 p-5 rounded-xl"
                style={{
                  border:
                    "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
                }}
              >
                <div className="flex flex-col gap-1">
                  <div className="font-sans font-semibold text-xl leading-7">
                    {f.name}
                  </div>
                  <div className="font-mono text-xs leading-4 opacity-70">
                    {f.cssVar} • {f.weights} • {f.role}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: f.fontFamily,
                    fontSize: 32,
                    lineHeight: "40px",
                    fontWeight: f.name === "Druk Cond Super" ? 1000 : 500,
                  }}
                >
                  {f.sample}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Text styles */}
        <Section
          title="Text styles"
          description="One row per style. Mobile (≤1024px) and Desktop (lg:, ≥1024px) shown side-by-side with their typography parameters and audit notes."
        >
          <div className="flex flex-col gap-4">
            {textStyles.map((entry) => (
              <TextStyleRow key={entry.id} entry={entry} />
            ))}
          </div>
        </Section>

        {/* Icons */}
        <Section
          title="Icons"
          description="12 custom SVG components. All inherit color via currentColor."
        >
          <IconGrid />
        </Section>

        {/* Colors */}
        <Section
          title="Colors"
          description="CSS @property variables. --accent is user-customizable; the rest are static."
        >
          <ColorSwatches />
        </Section>

        {/* Spacing */}
        <Section
          title="Spacing"
          description="No custom scale — Tailwind defaults are the design system here."
        >
          <SpacingScale />
        </Section>

        {/* Layout / Max-widths audit */}
        <Section
          title="Layout — max-widths"
          description="4 unique content-width values across the codebase. Strong candidate for unification."
        >
          <div
            className="overflow-x-auto rounded-xl"
            style={{
              border:
                "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
            }}
          >
            <table className="w-full text-left font-sans text-sm leading-5">
              <thead
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--foreground) 5%, transparent)",
                }}
              >
                <tr>
                  <th className="px-4 py-3 font-semibold">Width</th>
                  <th className="px-4 py-3 font-semibold">Where</th>
                  <th className="px-4 py-3 font-semibold">Audit</th>
                </tr>
              </thead>
              <tbody>
                {MAX_WIDTHS.map((m, i) => (
                  <tr
                    key={i}
                    style={{
                      borderTop:
                        "1px solid color-mix(in srgb, var(--foreground) 8%, transparent)",
                    }}
                  >
                    <td className="px-4 py-3 font-mono align-top">
                      {m.value}px
                    </td>
                    <td className="px-4 py-3 font-mono text-xs align-top">
                      {m.where}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <AuditBadge note="inconsistent" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Footer */}
        <footer
          className="pt-12 pb-4 font-mono text-xs leading-4 opacity-50"
          style={{ color: "var(--foreground)" }}
        >
          Catalog v1 — for unification audit. Unification of arbitrary values
          and max-widths is a follow-up task.
        </footer>
      </div>
    </div>
  );
}
