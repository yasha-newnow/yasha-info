"use client";

import { Fragment, useState } from "react";
import { motion } from "framer-motion";
import { sections } from "@/data/navigation";
import {
  bio,
  howText,
  skills,
  workHistory,
  COLLAPSED_COUNT,
  type WorkHistoryEntry,
} from "@/data/about";
import { SectionHeader } from "./section-header";
import { ButtonLink } from "./button-link";
import { WhatIcon, HowIcon, WhyIcon } from "./icons/about-icons";

// Glass surface — inline style, same as sidebar (Tailwind v4 compiles var() statically in CSS classes)
const glassStyle: React.CSSProperties = {
  background:
    "linear-gradient(var(--glass-overlay), var(--glass-overlay)), color-mix(in srgb, var(--accent) 70%, transparent)",
  backdropFilter: "blur(var(--blur-glass))",
  boxShadow: "0px 4px 15px color-mix(in srgb, var(--shadow-glass-color), transparent)",
};

const STAGGER_DELAY = 0.12;
const ITEM_DURATION = 0.35;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER_DELAY },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 4, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: ITEM_DURATION, ease: "easeOut" as const },
  },
};

function SkillDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="flex gap-1 shrink-0">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`text-sm leading-6 ${i <= level ? "text-foreground" : "text-foreground opacity-30"}`}
        >
          ●
        </span>
      ))}
    </span>
  );
}

function EntryRow({ entry }: { entry: WorkHistoryEntry }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-baseline gap-1 lg:gap-4 py-4">
      <div className="flex-1 flex flex-col gap-0.5">
        <span className="text-base font-medium leading-6 text-foreground">
          {entry.title}
        </span>
        <span className="text-sm leading-6 text-foreground opacity-70">
          {entry.description}
        </span>
      </div>
      <span className="font-tag text-base font-semibold leading-5 text-foreground shrink-0">
        {entry.period}
      </span>
    </div>
  );
}

export function AboutSection() {
  const [expanded, setExpanded] = useState(false);

  const visibleEntries = workHistory.slice(0, COLLAPSED_COUNT);
  const hiddenEntries = workHistory.slice(COLLAPSED_COUNT);

  return (
    <section
      id={sections[1].id}
      className="flex flex-col px-0 pt-20 pb-6 lg:px-10 lg:pb-10"
    >
      <SectionHeader title={sections[1].title} tag={sections[1].tag} />

      <motion.div
        className="flex flex-col lg:px-2"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Cards group (gap ~8px between cards) */}
        <div className="flex flex-col gap-2">
          {/* Card 1: WHAT + Bio — icon left, text right */}
          <motion.div
            variants={itemVariants}
            className="glass-card flex flex-wrap items-start gap-8"
            style={glassStyle}
          >
            <div className="w-[132px] h-[56px] shrink-0 flex items-center">
              <WhatIcon className="text-foreground" />
            </div>
            <p className="flex-1 min-w-[240px] text-base leading-6 text-foreground">{bio[0]}</p>
          </motion.div>

          {/* Card 2: HOW + Skills two columns */}
          <motion.div
            variants={itemVariants}
            className="glass-card flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16"
            style={glassStyle}
          >
            {/* Left column: HOW icon + description */}
            <div className="flex-1 flex flex-wrap items-start gap-8">
              <div className="w-[132px] h-[56px] shrink-0 flex items-center">
                <HowIcon className="text-foreground" />
              </div>
              <p className="flex-1 min-w-[240px] text-base leading-6 text-foreground">{howText}</p>
            </div>

            {/* Right column: Skills with dots and dividers */}
            <div className="flex-1 flex flex-col gap-4">
              {skills.map((skill, index) => (
                <Fragment key={skill.name}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm leading-6 text-foreground">
                      {skill.name}
                    </span>
                    <SkillDots level={skill.level} />
                  </div>
                  {index < skills.length - 1 && (
                    <div className="h-px bg-foreground opacity-10" />
                  )}
                </Fragment>
              ))}
            </div>
          </motion.div>

          {/* Card 3: WHY + Motivation — icon left, text right */}
          <motion.div
            variants={itemVariants}
            className="glass-card flex flex-wrap items-start gap-8"
            style={glassStyle}
          >
            <div className="w-[132px] h-[56px] shrink-0 flex items-center">
              <WhyIcon className="text-foreground" />
            </div>
            <p className="flex-1 min-w-[240px] text-base leading-6 text-foreground">{bio[1]}</p>
          </motion.div>
        </div>

        {/* Work History — NO glass card (Paper Design node 2Q-0) */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-6 mt-20"
        >
          <h3 className="text-2xl font-semibold leading-8 text-foreground">
            Work history
          </h3>

          <div className="flex flex-col">
            {/* Always visible entries */}
            {visibleEntries.map((entry, index) => (
              <div key={entry.title}>
                <EntryRow entry={entry} />
                {(index < visibleEntries.length - 1 || hiddenEntries.length > 0) && (
                  <div className="h-px bg-foreground opacity-10" />
                )}
              </div>
            ))}

            {/* Expandable entries */}
            <div
              className="expand-collapse"
              data-expanded={expanded ? "true" : "false"}
            >
              <div>
                {hiddenEntries.map((entry, index) => (
                  <div key={entry.title}>
                    <EntryRow entry={entry} />
                    {index < hiddenEntries.length - 1 && (
                      <div className="h-px bg-foreground opacity-10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle button — left aligned */}
          <div className="self-start">
            <ButtonLink onClick={() => setExpanded(!expanded)}>
              {expanded ? "Hide full history" : "View full work history"}
            </ButtonLink>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
