import { createElement, type ReactNode } from "react";

export type Variant = {
  font: string;
  size: number;
  lineHeight: number;
  weight: number;
  transform?: "uppercase";
  letterSpacing?: string;
};

export const FONT_VAR_MAP: Record<string, string> = {
  "Inter Tight": "var(--font-sans)",
  "Druk Cond": "var(--font-heading)",
  "Stick No Bills": "var(--font-tag)",
  "Homemade Apple": "var(--font-handwritten)",
};

export type TextStyleEntry = {
  id: string;
  label: string;
  tag: "h1" | "h2" | "h3" | "p" | "div" | "span";
  className?: string;
  sample: string;
  source: string;
  audit: string[];
  mobile: Variant;
  desktop: Variant;
};

const SAMPLE_HEADING = "The quick brown fox";
const SAMPLE_BODY =
  "Designer and educator with two decades of experience, obsessed with craft.";

export const textStyles: TextStyleEntry[] = [
  {
    id: "hero-title",
    label: "Hero title (.hero-title)",
    tag: "h2",
    className: "hero-title",
    sample: "I'M YASHA, PRODUCT DESIGNER.",
    source: "src/app/globals.css:97-109 (h2.hero-title)",
    audit: [],
    mobile: { font: "Druk Cond", size: 80, lineHeight: 72, weight: 1000, transform: "uppercase" },
    desktop: { font: "Druk Cond", size: 104, lineHeight: 88, weight: 1000, transform: "uppercase" },
  },
  {
    id: "section-h2",
    label: "Section H2 (<h2> base)",
    tag: "h2",
    className: undefined,
    sample: "Works & Bits",
    source: "src/app/globals.css:69-82",
    audit: [],
    mobile: { font: "Druk Cond", size: 64, lineHeight: 56, weight: 1000, transform: "uppercase" },
    desktop: { font: "Druk Cond", size: 88, lineHeight: 76, weight: 1000, transform: "uppercase" },
  },
  {
    id: "section-tag",
    label: "Section tag (.section-tag)",
    tag: "span",
    className: "section-tag",
    sample: "& Bits",
    source: "src/app/globals.css:83-94",
    audit: ["currently hidden in section-header.tsx"],
    mobile: { font: "Stick No Bills", size: 20, lineHeight: 28, weight: 500 },
    desktop: { font: "Stick No Bills", size: 32, lineHeight: 40, weight: 500 },
  },
  {
    id: "title-xl",
    label: "Title XL (.title-xl)",
    tag: "span",
    className: "title-xl",
    sample: "Works",
    source: "src/app/globals.css (title-xl) / button-menu-primary.tsx:246",
    audit: [],
    mobile: { font: "Inter Tight", size: 40, lineHeight: 48, weight: 600 },
    desktop: { font: "Inter Tight", size: 40, lineHeight: 48, weight: 600 },
  },
  {
    id: "title-lg",
    label: "Title LG (.title-lg)",
    tag: "h3",
    className: "title-lg",
    sample: "Preply",
    source: "src/app/globals.css (title-lg) / project-card.tsx:75",
    audit: [],
    mobile: { font: "Inter Tight", size: 28, lineHeight: 36, weight: 600 },
    desktop: { font: "Inter Tight", size: 32, lineHeight: 40, weight: 600 },
  },
  {
    id: "title-md",
    label: "Title MD (.title-md)",
    tag: "h3",
    className: "title-md",
    sample: "Work history",
    source: "src/app/globals.css (title-md) / hero.tsx, about-section.tsx, button-menu-primary.tsx",
    audit: ["+ .text-bold for w600 variant (work history, menu desktop)"],
    mobile: { font: "Inter Tight", size: 20, lineHeight: 28, weight: 400 },
    desktop: { font: "Inter Tight", size: 24, lineHeight: 32, weight: 400 },
  },
  {
    id: "body",
    label: "Body (.body)",
    tag: "p",
    className: "body",
    sample: SAMPLE_BODY,
    source: "src/app/globals.css (body)",
    audit: ["+ .text-medium for w500 variant (project-card, about, button-link)"],
    mobile: { font: "Inter Tight", size: 16, lineHeight: 24, weight: 400, letterSpacing: "0.03em" },
    desktop: { font: "Inter Tight", size: 16, lineHeight: 24, weight: 400, letterSpacing: "0.03em" },
  },
  {
    id: "body-sm",
    label: "Body small (.body-sm)",
    tag: "p",
    className: "body-sm",
    sample: "Designed and built the platform from scratch.",
    source: "src/app/globals.css (body-sm) / project-card.tsx:92, about-section.tsx:104",
    audit: ["+ .text-medium for w500 variant (no current consumers)"],
    mobile: { font: "Inter Tight", size: 14, lineHeight: 24, weight: 400, letterSpacing: "0.03em" },
    desktop: { font: "Inter Tight", size: 14, lineHeight: 24, weight: 400, letterSpacing: "0.03em" },
  },
  {
    id: "tag",
    label: "Tag (.tag)",
    tag: "span",
    className: "tag",
    sample: "& BITS",
    source: "src/app/globals.css (tag) / button-menu-primary.tsx:31, about-section.tsx:108",
    audit: [],
    mobile: { font: "Stick No Bills", size: 16, lineHeight: 20, weight: 600, transform: "uppercase" },
    desktop: { font: "Stick No Bills", size: 16, lineHeight: 20, weight: 600, transform: "uppercase" },
  },
  {
    id: "caption",
    label: "Caption (.caption)",
    tag: "span",
    className: "caption",
    sample: "MAR 2026",
    source: "src/app/globals.css (caption) / local-time.tsx, project-card.tsx",
    audit: ["+ .text-secondary for muted variant (currently used everywhere)"],
    mobile: { font: "Stick No Bills", size: 12, lineHeight: 16, weight: 500, transform: "uppercase", letterSpacing: "0.05em" },
    desktop: { font: "Stick No Bills", size: 12, lineHeight: 16, weight: 500, transform: "uppercase", letterSpacing: "0.05em" },
  },
  {
    id: "handwritten",
    label: "Handwritten (.handwritten)",
    tag: "span",
    className: "handwritten",
    sample: "Yasha Petrunin",
    source: "src/app/globals.css (handwritten) / sidebar.tsx:93, mobile-nav.tsx:266",
    audit: [],
    mobile: { font: "Homemade Apple", size: 28, lineHeight: 32, weight: 400 },
    desktop: { font: "Homemade Apple", size: 28, lineHeight: 32, weight: 400 },
  },
];

export function renderTextStyle(entry: TextStyleEntry): ReactNode {
  const props = entry.className ? { className: entry.className } : undefined;
  return createElement(entry.tag, props, entry.sample);
}

export const sampleHeading = SAMPLE_HEADING;
export const sampleBody = SAMPLE_BODY;
