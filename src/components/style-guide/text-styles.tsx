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
  "Roboto Mono": "var(--font-mono)",
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
    id: "hero-h1",
    label: "Hero H1",
    tag: "h1",
    className:
      "text-5xl lg:text-[64px] font-bold leading-tight lg:leading-[72px]",
    sample: "Hey, I'm Yasha.",
    source: "src/components/hero.tsx:35",
    audit: ["arbitrary text-[64px]", "arbitrary leading-[72px]"],
    mobile: { font: "Inter Tight", size: 48, lineHeight: 60, weight: 700 },
    desktop: { font: "Inter Tight", size: 64, lineHeight: 72, weight: 700 },
  },
  {
    id: "hero-body",
    label: "Hero body",
    tag: "p",
    className: "text-lg lg:text-xl leading-7 lg:leading-8 max-w-[1003px]",
    sample: SAMPLE_BODY,
    source: "src/components/hero.tsx:77",
    audit: ["max-w-[1003px] is unique to hero"],
    mobile: { font: "Inter Tight", size: 18, lineHeight: 28, weight: 400 },
    desktop: { font: "Inter Tight", size: 20, lineHeight: 32, weight: 400 },
  },
  {
    id: "section-h2",
    label: "Section H2 (base CSS)",
    tag: "h2",
    className: undefined,
    sample: "Works & Bits",
    source: "src/app/globals.css:69-82",
    audit: [],
    mobile: {
      font: "Druk Cond",
      size: 64,
      lineHeight: 56,
      weight: 1000,
      transform: "uppercase",
    },
    desktop: {
      font: "Druk Cond",
      size: 104,
      lineHeight: 88,
      weight: 1000,
      transform: "uppercase",
    },
  },
  {
    id: "section-tag",
    label: "Section tag (.section-tag)",
    tag: "span",
    className: "section-tag",
    sample: "& Bits",
    source: "src/app/globals.css:83-94",
    audit: [],
    mobile: { font: "Stick No Bills", size: 20, lineHeight: 28, weight: 500 },
    desktop: { font: "Stick No Bills", size: 32, lineHeight: 40, weight: 500 },
  },
  {
    id: "card-title",
    label: "Card title (company)",
    tag: "h3",
    className: "font-sans text-[32px] leading-[40px] font-semibold",
    sample: "Preply",
    source: "src/components/project-card.tsx:75",
    audit: ["arbitrary text-[32px]", "arbitrary leading-[40px]"],
    mobile: { font: "Inter Tight", size: 32, lineHeight: 40, weight: 600 },
    desktop: { font: "Inter Tight", size: 32, lineHeight: 40, weight: 600 },
  },
  {
    id: "card-body",
    label: "Card body / Job title",
    tag: "p",
    className: "font-sans text-base leading-6 font-medium",
    sample: "Senior Product Designer",
    source: "src/components/project-card.tsx:78",
    audit: [],
    mobile: { font: "Inter Tight", size: 16, lineHeight: 24, weight: 500 },
    desktop: { font: "Inter Tight", size: 16, lineHeight: 24, weight: 500 },
  },
  {
    id: "menu-mobile-label",
    label: "Menu mobile label",
    tag: "span",
    className: "font-sans font-semibold text-[40px] leading-[48px]",
    sample: "Works",
    source: "src/components/button-menu-primary.tsx:246",
    audit: ["arbitrary text-[40px]", "arbitrary leading-[48px]"],
    mobile: { font: "Inter Tight", size: 40, lineHeight: 48, weight: 600 },
    desktop: { font: "Inter Tight", size: 40, lineHeight: 48, weight: 600 },
  },
  {
    id: "menu-desktop-label",
    label: "Menu desktop label",
    tag: "span",
    className: "font-sans font-semibold text-2xl leading-8",
    sample: "Works",
    source: "src/components/button-menu-primary.tsx:155",
    audit: [],
    mobile: { font: "Inter Tight", size: 24, lineHeight: 32, weight: 600 },
    desktop: { font: "Inter Tight", size: 24, lineHeight: 32, weight: 600 },
  },
  {
    id: "menu-tag",
    label: "Menu tag (highlight)",
    tag: "span",
    className:
      "font-tag font-semibold text-[16px] leading-[20px] uppercase whitespace-nowrap",
    sample: "& BITS",
    source: "src/components/button-menu-primary.tsx:31",
    audit: ["arbitrary text-[16px]", "arbitrary leading-[20px]"],
    mobile: {
      font: "Stick No Bills",
      size: 16,
      lineHeight: 20,
      weight: 600,
      transform: "uppercase",
    },
    desktop: {
      font: "Stick No Bills",
      size: 16,
      lineHeight: 20,
      weight: 600,
      transform: "uppercase",
    },
  },
  {
    id: "caption-tag",
    label: "Caption tag (date / time)",
    tag: "span",
    className:
      "font-tag font-medium text-[12px] uppercase tracking-[0.03em] opacity-70",
    sample: "MAR 2026",
    source: "src/components/local-time.tsx:9 / project-card.tsx:81",
    audit: ["arbitrary text-[12px]"],
    mobile: {
      font: "Stick No Bills",
      size: 12,
      lineHeight: 16,
      weight: 500,
      transform: "uppercase",
      letterSpacing: "0.03em",
    },
    desktop: {
      font: "Stick No Bills",
      size: 12,
      lineHeight: 16,
      weight: 500,
      transform: "uppercase",
      letterSpacing: "0.03em",
    },
  },
  {
    id: "handwritten",
    label: "Handwritten accent",
    tag: "span",
    className: "font-handwritten text-[28px] leading-8 font-normal",
    sample: "Yasha Petrunin",
    source: "src/components/sidebar.tsx:96",
    audit: ["arbitrary text-[28px]"],
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
