"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { sections } from "@/data/navigation";
import { SectionHeader } from "./section-header";
import { CalInline } from "./cal-inline";

const STAGGER_DELAY = 0.12;
const ITEM_DURATION = 0.35;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER_DELAY } },
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

export function ContactSection() {
  const section = sections[2];
  const calRef = useRef<HTMLDivElement>(null);
  const calInView = useInView(calRef, { once: true, margin: "300px" });

  return (
    <section
      id={section.id}
      className="flex flex-col px-0 pt-10 lg:pt-20 pb-6 lg:px-10 lg:pb-10 scroll-mt-[88px] lg:scroll-mt-0"
    >
      <SectionHeader title={section.title} tag={section.tag} />

      <motion.div
        className="flex flex-col lg:px-2 gap-10 lg:gap-8 mt-0 lg:mt-0"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <p className="title-lg text-bold text-foreground">
            Always open to interesting projects and challenges.
            <br />
            Let&apos;s build something together.
          </p>
          <p className="body text-secondary text-foreground">
            Schedule a quick, 15 minute intro to see if we&apos;re good fit.
          </p>
        </motion.div>

        {/* Reserved height prevents layout jump from lazy-mount.
            No background: Cal renders centered inside its iframe, doesn't fill width —
            a tinted skeleton would visibly stick out around the Cal card. */}
        <motion.div
          ref={calRef}
          variants={itemVariants}
          className="w-full min-h-[640px] lg:min-h-[680px]"
        >
          {calInView && <CalInline />}
        </motion.div>
      </motion.div>
    </section>
  );
}
