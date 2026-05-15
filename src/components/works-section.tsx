"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { preload } from "react-dom";
import {
  useCaseCards,
  useCaseStudies,
  useCaseStudyBySlug,
} from "@/lib/edit-mode/content-context";
import { sections } from "@/data/navigation";
import { ProjectCard } from "./project-card";
import { SectionHeader } from "./section-header";
import { ProjectSheet } from "./project-sheet";

const STAGGER_DELAY = 0.15;
const ITEM_DURATION = 0.3;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_DELAY,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 4, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: ITEM_DURATION, ease: "easeOut" as const },
  },
};

function prefetchHero(src: string) {
  preload(src, { as: "image" });
}

export function WorksSection() {
  const caseCards = useCaseCards();
  const caseStudies = useCaseStudies();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeStudy = useCaseStudyBySlug(activeSlug);

  const studyBySlug = (slug: string | null) =>
    slug ? (caseStudies.find((s) => s.slug === slug) ?? null) : null;

  return (
    <section id="works" className="flex flex-col px-0 lg:px-10 pt-10 lg:pt-20 pb-10 scroll-mt-[88px] lg:scroll-mt-0">
      <div>
        <SectionHeader title={sections[0].title} tag={sections[0].tag} />
      </div>

      {/* Cards list */}
      <motion.div
        className="flex flex-col gap-6 lg:gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {caseCards.map((card, cardIndex) => {
          const study = studyBySlug(card.caseSlug);
          return (
            <motion.div key={card.slug} variants={cardVariants} className="w-full">
              <ProjectCard
                card={card}
                cardIndex={cardIndex}
                onClick={
                  study
                    ? () => {
                        setActiveSlug(study.slug);
                        setSheetOpen(true);
                      }
                    : undefined
                }
                onPrefetch={study ? () => prefetchHero(study.heroImage.src) : undefined}
              />
            </motion.div>
          );
        })}
      </motion.div>

      <ProjectSheet
        caseStudy={activeStudy}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onAnimationEnd={(isOpen) => { if (!isOpen) setActiveSlug(null); }}
      />
    </section>
  );
}
