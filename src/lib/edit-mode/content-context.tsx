"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type {
  CaseCard,
  CaseStudy,
  ContentFileKey,
  Skill,
  WorkHistoryEntry,
} from "@/data/schemas";

export interface ContentData {
  caseCards: CaseCard[];
  caseStudies: CaseStudy[];
  about: {
    bio: string[];
    howText: string;
    skills: Skill[];
    workHistory: WorkHistoryEntry[];
  };
}

interface ContentContextValue {
  data: ContentData;
  applyEdit: (
    fileKey: ContentFileKey,
    fieldPath: string[],
    value: unknown,
  ) => void;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({
  initial,
  children,
}: {
  initial: ContentData;
  children: ReactNode;
}) {
  const [data, setData] = useState<ContentData>(initial);

  const applyEdit = useCallback(
    (fileKey: ContentFileKey, fieldPath: string[], value: unknown) => {
      setData((prev) => {
        const next = structuredClone(prev) as ContentData;
        // For "about", fieldPath like ["bio", "0"] navigates inside data.about.
        // For others, fieldPath like ["0", "company"] navigates inside
        // data.caseCards / data.caseStudies (matching the server payload).
        let target: Record<string, unknown> | unknown[] =
          fileKey === "about"
            ? (next.about as unknown as Record<string, unknown>)
            : ((next as unknown as Record<string, unknown>)[fileKey] as
                | unknown[]
                | Record<string, unknown>);
        for (let i = 0; i < fieldPath.length - 1; i++) {
          const seg = fieldPath[i];
          const stepped =
            Array.isArray(target)
              ? target[Number(seg)]
              : (target as Record<string, unknown>)[seg];
          if (stepped === null || typeof stepped !== "object") return prev;
          target = stepped as Record<string, unknown> | unknown[];
        }
        const last = fieldPath[fieldPath.length - 1];
        if (Array.isArray(target)) {
          target[Number(last)] = value;
        } else {
          target[last] = value;
        }
        return next;
      });
    },
    [],
  );

  return (
    <ContentContext.Provider value={{ data, applyEdit }}>
      {children}
    </ContentContext.Provider>
  );
}

function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error(
      "useContent must be used inside <ContentProvider>. Server load missing?",
    );
  }
  return ctx;
}

export function useCaseCards(): CaseCard[] {
  return useContent().data.caseCards;
}

export function useCaseStudies(): CaseStudy[] {
  return useContent().data.caseStudies;
}

export function useCaseStudyBySlug(
  slug: string | null | undefined,
): CaseStudy | null {
  const list = useCaseStudies();
  if (!slug) return null;
  return list.find((s) => s.slug === slug) ?? null;
}

export function useAbout(): ContentData["about"] {
  return useContent().data.about;
}

export function useApplyContentEdit() {
  return useContent().applyEdit;
}
