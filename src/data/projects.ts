export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  idle: { rotate: number; x: string; y: string };
  hover: { rotate: number; x: string; y: string };
  borderRadius: number;
  shadow: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Project {
  slug: string;
  company: string;
  logoSrc: string;
  date: string;
  jobTitle: string;
  bullets: string[];
  images: ProjectImage[];
  galleryImages: GalleryImage[];
  mobileImageSrc: string;
  mobileImageAlt: string;
}

const IMAGE_SHADOW = "0px 15px 30px #00000012";

export const projects: Project[] = [
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
    galleryImages: [
      { src: "/images/projects/preply-main.jpg", alt: "Preply SEO analysis interface", width: 839, height: 525 },
      { src: "/images/projects/preply-sidebar.jpg", alt: "Preply sidebar navigation", width: 180, height: 578 },
      { src: "/images/projects/preply-panels.jpg", alt: "Preply analysis panels", width: 225, height: 578 },
      { src: "/images/projects/preply-main.jpg", alt: "Preply analysis — additional view 1", width: 839, height: 525 },
      { src: "/images/projects/preply-main.jpg", alt: "Preply analysis — additional view 2", width: 839, height: 525 },
      { src: "/images/projects/preply-main.jpg", alt: "Preply analysis — additional view 3", width: 839, height: 525 },
    ],
    mobileImageSrc: "/images/projects/preply-main.jpg",
    mobileImageAlt: "Preply product interface",
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
    galleryImages: [
      { src: "/images/projects/preply-main.jpg", alt: "FinFlow dashboard", width: 839, height: 525 },
      { src: "/images/projects/preply-sidebar.jpg", alt: "FinFlow sidebar", width: 180, height: 578 },
      { src: "/images/projects/preply-panels.jpg", alt: "FinFlow panels", width: 225, height: 578 },
    ],
    mobileImageSrc: "/images/projects/preply-main.jpg",
    mobileImageAlt: "FinFlow dashboard interface",
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
    galleryImages: [
      { src: "/images/projects/preply-main.jpg", alt: "Soundscape player", width: 839, height: 525 },
      { src: "/images/projects/preply-sidebar.jpg", alt: "Soundscape sidebar", width: 180, height: 578 },
      { src: "/images/projects/preply-panels.jpg", alt: "Soundscape panels", width: 225, height: 578 },
    ],
    mobileImageSrc: "/images/projects/preply-main.jpg",
    mobileImageAlt: "Soundscape music app",
  },
];
