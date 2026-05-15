// Server-only loader. Reads each content JSON fresh from disk on every call
// so dev-time edits propagate to SSR without restarting the dev server.
// (No `server-only` import — not installed; we rely on the use of `fs`
// keeping this file from being bundled into Client Components.)

import { promises as fs } from "fs";
import path from "path";
import {
  AboutFileSchema,
  CaseCardsFileSchema,
  CaseStudiesFileSchema,
  type CaseCard,
  type CaseStudy,
  type Skill,
  type WorkHistoryEntry,
} from "./schemas";

// Content lives at <repo>/content (outside src/) so Turbopack does not watch
// it. Otherwise every JSON write would trigger an HMR refresh that resets
// Client Component state (Vaul drawer would auto-close on each save).
const CONTENT_DIR = path.join(process.cwd(), "content");

export interface ServerContent {
  caseCards: CaseCard[];
  caseStudies: CaseStudy[];
  about: {
    bio: string[];
    howText: string;
    skills: Skill[];
    workHistory: WorkHistoryEntry[];
  };
}

async function readJson<T>(fileName: string): Promise<T> {
  const raw = await fs.readFile(path.join(CONTENT_DIR, fileName), "utf-8");
  return JSON.parse(raw) as T;
}

export async function loadAllContent(): Promise<ServerContent> {
  const [caseCardsRaw, caseStudiesRaw, aboutRaw] = await Promise.all([
    readJson("case-cards.json"),
    readJson("case-studies.json"),
    readJson("about.json"),
  ]);

  const caseCards = CaseCardsFileSchema.parse(caseCardsRaw).caseCards;
  const caseStudies = CaseStudiesFileSchema.parse(caseStudiesRaw).caseStudies;
  const about = AboutFileSchema.parse(aboutRaw);

  return { caseCards, caseStudies, about };
}
