"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { projects, type Project } from "@/data/projects";
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

export function WorksSection() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <section id="works" className="flex flex-col px-0 lg:px-10 pt-20 pb-6 lg:pb-10">
      <div>
        <SectionHeader title={sections[0].title} tag={sections[0].tag} />
      </div>

      {/* Cards list */}
      <motion.div
        className="flex flex-col gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {projects.map((project) => (
          <motion.div key={project.slug} variants={cardVariants} className="w-full">
            <ProjectCard project={project} onClick={() => setActiveProject(project)} />
          </motion.div>
        ))}
      </motion.div>

      <ProjectSheet
        project={activeProject}
        open={activeProject !== null}
        onOpenChange={(open) => { if (!open) setActiveProject(null); }}
      />
    </section>
  );
}
