import { z } from "zod";

export const GalleryImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  width: z.number(),
  height: z.number(),
});

export const CaseSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  images: z.array(GalleryImageSchema),
});

export const CaseStudySchema = z.object({
  slug: z.string(),
  company: z.string(),
  logoSrc: z.string(),
  description: z.string(),
  role: z.string(),
  timeframe: z.string(),
  scope: z.string(),
  platform: z.string(),
  viewSiteUrl: z.string().nullable(),
  heroImage: GalleryImageSchema,
  sections: z.array(CaseSectionSchema),
});

export const CaseStudiesFileSchema = z.object({
  caseStudies: z.array(CaseStudySchema),
});

const TransformSchema = z.object({
  rotate: z.number(),
  x: z.string(),
  y: z.string(),
});

export const CardImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  width: z.number(),
  height: z.number(),
  idle: TransformSchema,
  hover: TransformSchema,
  borderRadius: z.number(),
  shadow: z.string(),
});

export const CaseCardSchema = z.object({
  slug: z.string(),
  company: z.string(),
  logoSrc: z.string(),
  date: z.string(),
  jobTitle: z.string(),
  bullets: z.array(z.string()),
  images: z.array(CardImageSchema),
  mobileImageSrc: z.string(),
  mobileImageAlt: z.string(),
  caseSlug: z.string().nullable(),
});

export const CaseCardsFileSchema = z.object({
  caseCards: z.array(CaseCardSchema),
});

export const SkillLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const SkillSchema = z.object({
  name: z.string(),
  level: SkillLevelSchema,
});

export const WorkHistoryEntrySchema = z.object({
  title: z.string(),
  description: z.string(),
  period: z.string(),
});

export const AboutFileSchema = z.object({
  bio: z.array(z.string()),
  howText: z.string(),
  skills: z.array(SkillSchema),
  workHistory: z.array(WorkHistoryEntrySchema),
});

export type GalleryImage = z.infer<typeof GalleryImageSchema>;
export type CaseSection = z.infer<typeof CaseSectionSchema>;
export type CaseStudy = z.infer<typeof CaseStudySchema>;
export type CardImage = z.infer<typeof CardImageSchema>;
export type CaseCard = z.infer<typeof CaseCardSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type WorkHistoryEntry = z.infer<typeof WorkHistoryEntrySchema>;

export type ContentFileKey = "caseStudies" | "caseCards" | "about";

export const CONTENT_FILE_REGISTRY = {
  caseStudies: { fileName: "case-studies.json", schema: CaseStudiesFileSchema },
  caseCards: { fileName: "case-cards.json", schema: CaseCardsFileSchema },
  about: { fileName: "about.json", schema: AboutFileSchema },
} as const;
