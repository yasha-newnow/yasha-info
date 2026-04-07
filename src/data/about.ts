export interface WorkHistoryEntry {
  title: string;
  description: string;
  period: string;
}

export interface Skill {
  name: string;
  level: 1 | 2 | 3;
}

export const bio = [
  "10+ years designing mobile apps, fintech, and complex B2B platforms — from Sberbank's 50+M users to SimilarWeb's analytics platform to growing Preply's global learning marketplace.",
  "The way things work can always (almost) work better. Driven to build products that users love and business profit from, following existential urge to make world better.",
];

export const howText =
  "Zooming out to see the full picture, challenging status quo and applying design principles in order to understand if we're solving a right problem. It helps to find where the real leverage is, build a clear strategy — and then adapt it ruthlessly as reality pushes back.";

export const skills: Skill[] = [
  { name: "UX/UI & Interaction Design", level: 3 },
  { name: "Product & Design Strategy", level: 3 },
  { name: "Design thinking", level: 2 },
  { name: "Qualitative & Quantitative User Research", level: 3 },
  { name: "A/B testing & Product Analytics", level: 3 },
];

export const workHistory: WorkHistoryEntry[] = [
  {
    title: "Senior Designer at Preply",
    description: "Growth design team, tutor-side experience.",
    period: "2025 – 2026",
  },
  {
    title: "Senior Designer at Guesty",
    description:
      "Business & Financials domain features, Cross-platform onboarding, Notifications system revamp.",
    period: "2024 – 2025",
  },
  {
    title: "Senior Designer at SimilarWeb",
    description:
      "Navigation redesign, Core platform products optimization, Market Research and Demand Analysis pods launch.",
    period: "2021 – 2024",
  },
  {
    title: "Lead Designer at Sber",
    description:
      "Personal finance services in core banking iOS / Android apps, led 3-designer team.",
    period: "2019 – 2021",
  },
  {
    title: "Senior Designer at Bankex",
    description: "Crypto trading & custodian service, 0→1 product launch.",
    period: "2018 – 2019",
  },
  {
    title: "Senior Designer at COMS",
    description: "Enterprise network monitoring platform redesign.",
    period: "2018",
  },
  {
    title: "UX/UI Designer at Svyaznoy",
    description: "Corporate platform, cross-platform mobile app.",
    period: "2017",
  },
  {
    title: "UX/UI & Brand Designer at Armex",
    description: "Art direction, branding & digital projects for banks.",
    period: "2016 – 2017",
  },
];

export const COLLAPSED_COUNT = 4;
