export interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface CaseSection {
  title: string;
  description: string;
  images: GalleryImage[];
}

export interface CaseStudy {
  slug: string;
  company: string;
  logoSrc: string;
  description: string;
  role: string;
  timeframe: string;
  scope: string;
  platform: string;
  viewSiteUrl: string | null;
  heroImage: GalleryImage;
  sections: CaseSection[];
}

const PLACEHOLDER_DESCRIPTION =
  "We built Control Tower because no existing tool gave us what we actually needed — a single place to see how the studio is doing. Not just project status, but the full picture: who's stretched, what's profitable, where there's room to take on more. It's an internal tool, built for how we work, pulling everything into one AI-native surface so decisions about capacity, hiring, and client work happen based on real numbers instead of gut feel.";

const PLACEHOLDER_HERO: GalleryImage = {
  src: "/images/projects/preply-main.jpg",
  alt: "Project hero image",
  width: 3000,
  height: 2000,
};

const PLACEHOLDER_GALLERY: GalleryImage[] = [
  { src: "/images/projects/preply-main.jpg", alt: "Detail view 1", width: 3000, height: 2000 },
  { src: "/images/projects/preply-sidebar.jpg", alt: "Detail view 2", width: 1500, height: 2000 },
  { src: "/images/projects/portrait-test.png", alt: "Portrait test", width: 1018, height: 1780 },
  { src: "/images/projects/preply-panels.jpg", alt: "Detail view 3", width: 3000, height: 4000 },
  { src: "/images/projects/portrait-test.png", alt: "Portrait test (last)", width: 1018, height: 1780 },
];

const PLACEHOLDER_SECTIONS: CaseSection[] = [
  {
    title: "Market Research & Demand Analysis",
    description: PLACEHOLDER_DESCRIPTION,
    images: PLACEHOLDER_GALLERY,
  },
  {
    title: "Website Segments",
    description: PLACEHOLDER_DESCRIPTION,
    images: PLACEHOLDER_GALLERY,
  },
  {
    title: "Website Segments",
    description: PLACEHOLDER_DESCRIPTION,
    images: PLACEHOLDER_GALLERY,
  },
];

export const caseStudies: CaseStudy[] = [
  {
    slug: "similarweb",
    company: "SimilarWeb",
    logoSrc: "/images/logos/similarweb.svg",
    description:
      "At SimilarWeb, I joined as a Senior Product Designer to work on core platform products with a team of designers. I led the redesign of platform navigation, the rebuild of the Website Segments product (the main URL-grouping tool used across the platform), and the 0→1 launch of the Market Research and Demand Analysis product pods.",
    role: "Senior Designer",
    timeframe: "2021 – 2024",
    scope: "Product Strategy, Information Architecture, Usability Testing, Stakeholder Alignment, 0→1 Product Launch",
    platform: "Web",
    viewSiteUrl: "https://www.similarweb.com",
    heroImage: PLACEHOLDER_HERO,
    sections: [
      {
        title: "Sidebar redesign",
        description:
          "SimilarWeb's primary nav, still problematic six months after the previous redesign. A 1.5-hour Team Challenge became a cross-team initiative — 6 designers in 3 subteams, plus PMs, FE/BE, UX writer, design director. Research and synthesis were team work. My IA analysis showed the nav was crooked across sections; the Acquisition homepage was the blocker, but its owners pushed back until the 0.6% engagement metric settled it. Removal unlocked re-aligning IA across sections, not just patching the sidebar. I owned final design end-to-end and most of the internal selling. Kept FE-only. Nav time 1.3 min → 42 sec (−53%); MAU x2-3 in buried pages.",
        images: PLACEHOLDER_GALLERY,
      },
      {
        title: "Website Segments",
        description:
          "Website Segments lets users group URLs by parameters (categories, sections) to track defined slices separately. The product made up 35% of platform revenue; pricing scaled by segment quota — even Top Tier Enterprise packages capped at 25 unique segments — so every new segment was direct revenue. As a new hire I inherited a 165-slide research deck plus FullStory, Mixpanel, and BI data. Synthesis was a collaboration with VP and Team Lead — 18 problems narrowed to three: opaque Include/Exclude logic, multi-step wizard, no URL preview. 8 RITE prototype interviews shaped direction. I owned the design (with PM, FE, UX writer): single-screen builder, live URL preview, two Include/Exclude buckets. Time to create 4.05 min → 23 sec (−90.6%); creation conversion 64% → 81%; avg segments per user +0.633.",
        images: PLACEHOLDER_GALLERY,
      },
    ],
  },
  {
    slug: "sber",
    company: "Sber",
    logoSrc: "/images/logos/sber.svg",
    description:
      "Sber spun up an internal PFM (Personal Financial Management) startup to address Russia's savings and financial education problem — 43% with no savings, 82% not planning expenses, 98% not investing. The Tribe began with five product teams and grew to twelve over three years. I owned design for the Total Funds product group, which started as one team and grew into three during my tenure.",
    role: "Lead Designer",
    timeframe: "2019 – 2021",
    scope: "Product Strategy, Design Thinking, Information Architecture, Stakeholder Alignment",
    platform: "iOS, Android",
    viewSiteUrl: "https://www.sberbank.ru",
    heroImage: {
      src: "/images/projects/sber-hero.png",
      alt: "Total Funds redesign — old 12-segment product pie versus new asset-type donut with leading buttons",
      width: 3840,
      height: 2156,
    },
    sections: [
      {
        title: "Total Funds rebuild",
        description:
          "I owned design for Total Funds with a PM and two other designers. The old version was a 12-segment product pie nobody read as 'composition of capital'. We replaced it with a donut grouped by asset type (Cards, Savings, Investments, outside-Sber) plus leading buttons for next-product actions. The donut isn't the most accurate chart and adjacent teams pushed back — we held the line and partnered with Sber's gamification team on the spin: haptics, rolling numbers, color logic per category. ~88% of users actually spun it. Total Funds became Sber's 2nd-most-popular entry to the inner market — ~13% of customers came through, generating $20M+ in invest-product cross-sell in 2021.",
        images: [
          {
            src: "/images/projects/sber-app-context.png",
            alt: "Total Funds widget inside the main Sber app surface",
            width: 3840,
            height: 2400,
          },
          {
            src: "/images/projects/sber-filters.png",
            alt: "Five filter states of the asset donut: All, Cards, Savings, Investments, Outside Sber",
            width: 3840,
            height: 2400,
          },
        ],
      },
      {
        title: "Financial Cushion",
        description:
          "Inside Total Funds, the standard 'set a goal' flow had weak follow-through — people set targets, then dropped off. We built a dedicated Financial Cushion flow framed in human terms ('for what?', 'how much do I need?'), auto-calculating the amount from the user's own monthly spending. I designed the flow with the team and helped scope the cut of a much-loved sibling idea — 'Business Angel,' a feature letting a trusted third party hold part of your wallet, scrapped because the fiduciary structure raised juridical issues we couldn't resolve. Users who set up a cushion from Total Funds continued accumulating at +81% the rate of users with ordinary Targets.",
        images: [
          {
            src: "/images/projects/sber-cushion.png",
            alt: "Financial Cushion setup flow with auto-calculated target",
            width: 3840,
            height: 2400,
          },
        ],
      },
      {
        title: "We were wrong",
        description:
          "Post-launch metrics inverted our assumption. In user testing people understood the deep-analysis tools — filters, history slicing, multi-angle grouping — but in production, a funny-small percentage actually used them. Even our high-income target users wanted simpler triggers, not analytical surface area. We ran another round of research focused on real usage; I owned the cut list with the PM. Final reduced foreground: balance, open-a-product, switch-grouping. The rest pushed into secondary navigation or out entirely. Retention climbed to 5.3% (from 2.6%), conversion to inner-market sales kept rising, CSI lifted. Testing measures comprehension; production measures want.",
        images: [
          {
            src: "/images/projects/sber-graph.png",
            alt: "Stripped-back Total Funds view with capital history graph",
            width: 3840,
            height: 2400,
          },
          {
            src: "/images/projects/sber-dark.png",
            alt: "Dark mode treatment of the simplified Total Funds view",
            width: 3840,
            height: 2400,
          },
        ],
      },
    ],
  },
  {
    slug: "preply",
    company: "Preply",
    logoSrc: "/images/logos/preply.svg",
    description: PLACEHOLDER_DESCRIPTION,
    role: "Principal Designer",
    timeframe: "2021 — 2024",
    scope: "UI/UX Design, Design System, Product Strategy, Team Leadership",
    platform: "Web",
    viewSiteUrl: "https://preply.com",
    heroImage: PLACEHOLDER_HERO,
    sections: PLACEHOLDER_SECTIONS,
  },
  {
    slug: "finflow",
    company: "FinFlow",
    logoSrc: "/images/logos/finflow.svg",
    description: PLACEHOLDER_DESCRIPTION,
    role: "Sr. Product Designer",
    timeframe: "2019 — 2021",
    scope: "Product Design, Design System, User Research",
    platform: "Web, iOS",
    viewSiteUrl: null,
    heroImage: PLACEHOLDER_HERO,
    sections: PLACEHOLDER_SECTIONS,
  },
  {
    slug: "soundscape",
    company: "Soundscape",
    logoSrc: "/images/logos/soundscape.svg",
    description: PLACEHOLDER_DESCRIPTION,
    role: "Product Designer",
    timeframe: "2017 — 2019",
    scope: "Product Design, Onboarding, Social Features",
    platform: "iOS, Android",
    viewSiteUrl: "https://soundscape.example.com",
    heroImage: PLACEHOLDER_HERO,
    sections: PLACEHOLDER_SECTIONS,
  },
];

export function getCaseStudyBySlug(slug: string | null | undefined): CaseStudy | null {
  if (!slug) return null;
  return caseStudies.find((s) => s.slug === slug) ?? null;
}
