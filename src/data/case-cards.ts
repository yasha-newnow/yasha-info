export interface CardImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  idle: { rotate: number; x: string; y: string };
  hover: { rotate: number; x: string; y: string };
  borderRadius: number;
  shadow: string;
}

export interface CaseCard {
  slug: string;
  company: string;
  logoSrc: string;
  date: string;
  jobTitle: string;
  bullets: string[];
  images: CardImage[];
  mobileImageSrc: string;
  mobileImageAlt: string;
  caseSlug: string | null;
}

const IMAGE_SHADOW = "0px 15px 30px #00000012";

export const caseCards: CaseCard[] = [
  {
    slug: "similarweb",
    company: "SimilarWeb",
    logoSrc: "/images/logos/similarweb.svg",
    date: "2021 — 2024",
    jobTitle: "Senior Designer",
    bullets: [
      "Sidebar redesign — nav −53%",
      "Website Segments",
      "Market Research pods launch (0→1)",
      "Core platform alignment",
    ],
    images: [
      {
        src: "/images/projects/preply-main.jpg",
        alt: "SimilarWeb sidebar redesign",
        width: 839,
        height: 525,
        idle: { rotate: -3.08, x: "26px", y: "calc(-50% + 28px)" },
        hover: { rotate: -4.56, x: "0px", y: "calc(-50% + 28px)" },
        borderRadius: 8,
        shadow: IMAGE_SHADOW,
      },
      {
        src: "/images/projects/preply-sidebar.jpg",
        alt: "SimilarWeb navigation detail",
        width: 180,
        height: 578,
        idle: { rotate: 3.93, x: "calc(-50% + 176px)", y: "calc(-50% - 3px)" },
        hover: { rotate: 4.79, x: "calc(-50% + 184px)", y: "calc(-50% - 12px)" },
        borderRadius: 16,
        shadow: IMAGE_SHADOW,
      },
      {
        src: "/images/projects/preply-panels.jpg",
        alt: "SimilarWeb platform panels",
        width: 225,
        height: 578,
        idle: { rotate: 8.64, x: "calc(-50% + 345px)", y: "calc(-50% - 17px)" },
        hover: { rotate: 10.11, x: "calc(-50% + 365px)", y: "calc(-50% - 34px)" },
        borderRadius: 20,
        shadow: IMAGE_SHADOW,
      },
    ],
    mobileImageSrc: "/images/projects/preply-main.jpg",
    mobileImageAlt: "SimilarWeb platform interface",
    caseSlug: "similarweb",
  },
  {
    slug: "sber",
    company: "Sber",
    logoSrc: "/images/logos/sber.svg",
    date: "2019 — 2021",
    jobTitle: "Lead Designer",
    bullets: [
      "Total Funds rebuild",
      "Donut + haptic interactions",
      "Financial Cushion behavioral design",
      "Post-launch simplicity pivot",
    ],
    images: [
      {
        src: "/images/projects/preply-main.jpg",
        alt: "Sber Total Funds dashboard",
        width: 839,
        height: 525,
        idle: { rotate: -3.08, x: "26px", y: "calc(-50% + 28px)" },
        hover: { rotate: -4.56, x: "0px", y: "calc(-50% + 28px)" },
        borderRadius: 8,
        shadow: IMAGE_SHADOW,
      },
      {
        src: "/images/projects/preply-sidebar.jpg",
        alt: "Sber Total Funds detail",
        width: 180,
        height: 578,
        idle: { rotate: 3.93, x: "calc(-50% + 176px)", y: "calc(-50% - 3px)" },
        hover: { rotate: 4.79, x: "calc(-50% + 184px)", y: "calc(-50% - 12px)" },
        borderRadius: 16,
        shadow: IMAGE_SHADOW,
      },
      {
        src: "/images/projects/preply-panels.jpg",
        alt: "Sber Total Funds variants",
        width: 225,
        height: 578,
        idle: { rotate: 8.64, x: "calc(-50% + 345px)", y: "calc(-50% - 17px)" },
        hover: { rotate: 10.11, x: "calc(-50% + 365px)", y: "calc(-50% - 34px)" },
        borderRadius: 20,
        shadow: IMAGE_SHADOW,
      },
    ],
    mobileImageSrc: "/images/projects/preply-main.jpg",
    mobileImageAlt: "Sber Total Funds app",
    caseSlug: "sber",
  },
  {
    slug: "preply",
    company: "Preply",
    logoSrc: "/images/logos/preply.svg",
    date: "2021 — 2024",
    jobTitle: "Principal Designer",
    bullets: [
      "Design system architecture",
      "Product design leadership",
      "Cross-platform experience",
      "Team mentorship program",
    ],
    images: [
      {
        src: "/images/projects/preply-main.jpg",
        alt: "Preply SEO analysis interface",
        width: 839,
        height: 525,
        idle: { rotate: -3.08, x: "26px", y: "calc(-50% + 28px)" },
        hover: { rotate: -4.56, x: "0px", y: "calc(-50% + 28px)" },
        borderRadius: 8,
        shadow: IMAGE_SHADOW,
      },
      {
        src: "/images/projects/preply-sidebar.jpg",
        alt: "Preply sidebar navigation",
        width: 180,
        height: 578,
        idle: { rotate: 3.93, x: "calc(-50% + 176px)", y: "calc(-50% - 3px)" },
        hover: { rotate: 4.79, x: "calc(-50% + 184px)", y: "calc(-50% - 12px)" },
        borderRadius: 16,
        shadow: IMAGE_SHADOW,
      },
      {
        src: "/images/projects/preply-panels.jpg",
        alt: "Preply analysis panels",
        width: 225,
        height: 578,
        idle: { rotate: 8.64, x: "calc(-50% + 345px)", y: "calc(-50% - 17px)" },
        hover: { rotate: 10.11, x: "calc(-50% + 365px)", y: "calc(-50% - 34px)" },
        borderRadius: 20,
        shadow: IMAGE_SHADOW,
      },
    ],
    mobileImageSrc: "/images/projects/preply-main.jpg",
    mobileImageAlt: "Preply product interface",
    caseSlug: "preply",
  },
  {
    slug: "finflow",
    company: "FinFlow",
    logoSrc: "/images/logos/finflow.svg",
    date: "2019 — 2021",
    jobTitle: "Sr. Product Designer",
    bullets: [
      "Dashboard redesign",
      "Mobile banking app",
      "Design system v2",
      "User research ops",
    ],
    images: [
      {
        src: "/images/projects/preply-main.jpg",
        alt: "FinFlow dashboard",
        width: 839,
        height: 525,
        idle: { rotate: -3.08, x: "26px", y: "calc(-50% + 28px)" },
        hover: { rotate: -4.56, x: "0px", y: "calc(-50% + 28px)" },
        borderRadius: 8,
        shadow: IMAGE_SHADOW,
      },
      {
        src: "/images/projects/preply-sidebar.jpg",
        alt: "FinFlow sidebar",
        width: 180,
        height: 578,
        idle: { rotate: 3.93, x: "calc(-50% + 176px)", y: "calc(-50% - 3px)" },
        hover: { rotate: 4.79, x: "calc(-50% + 184px)", y: "calc(-50% - 12px)" },
        borderRadius: 16,
        shadow: IMAGE_SHADOW,
      },
      {
        src: "/images/projects/preply-panels.jpg",
        alt: "FinFlow panels",
        width: 225,
        height: 578,
        idle: { rotate: 8.64, x: "calc(-50% + 345px)", y: "calc(-50% - 17px)" },
        hover: { rotate: 10.11, x: "calc(-50% + 365px)", y: "calc(-50% - 34px)" },
        borderRadius: 20,
        shadow: IMAGE_SHADOW,
      },
    ],
    mobileImageSrc: "/images/projects/preply-main.jpg",
    mobileImageAlt: "FinFlow dashboard interface",
    caseSlug: "finflow",
  },
  {
    slug: "soundscape",
    company: "Soundscape",
    logoSrc: "/images/logos/soundscape.svg",
    date: "2017 — 2019",
    jobTitle: "Product Designer",
    bullets: [
      "Playlist experience",
      "Social features",
      "Artist dashboard",
      "Onboarding flow",
    ],
    images: [
      {
        src: "/images/projects/preply-main.jpg",
        alt: "Soundscape player",
        width: 839,
        height: 525,
        idle: { rotate: -3.08, x: "26px", y: "calc(-50% + 28px)" },
        hover: { rotate: -4.56, x: "0px", y: "calc(-50% + 28px)" },
        borderRadius: 8,
        shadow: IMAGE_SHADOW,
      },
      {
        src: "/images/projects/preply-sidebar.jpg",
        alt: "Soundscape sidebar",
        width: 180,
        height: 578,
        idle: { rotate: 3.93, x: "calc(-50% + 176px)", y: "calc(-50% - 3px)" },
        hover: { rotate: 4.79, x: "calc(-50% + 184px)", y: "calc(-50% - 12px)" },
        borderRadius: 16,
        shadow: IMAGE_SHADOW,
      },
      {
        src: "/images/projects/preply-panels.jpg",
        alt: "Soundscape panels",
        width: 225,
        height: 578,
        idle: { rotate: 8.64, x: "calc(-50% + 345px)", y: "calc(-50% - 17px)" },
        hover: { rotate: 10.11, x: "calc(-50% + 365px)", y: "calc(-50% - 34px)" },
        borderRadius: 20,
        shadow: IMAGE_SHADOW,
      },
    ],
    mobileImageSrc: "/images/projects/preply-main.jpg",
    mobileImageAlt: "Soundscape music app",
    caseSlug: "soundscape",
  },
];
