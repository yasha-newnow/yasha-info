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
