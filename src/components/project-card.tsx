"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExpandIcon } from "./icons";
import type { Project, ProjectImage } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

/* ─── Desktop Card ─── */

function ProjectCardDesktop({ project }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="@container w-full max-w-[1200px]">
      {/* Hover wrapper — fixed size, card grows into it */}
      <div
        className="relative w-full overflow-visible"
        style={{
          height: "clamp(696px, calc(696px + (100cqw - 1024px) * 0.32), 752px)",
        }}
      >
        <motion.article
          className="
            absolute flex flex-row gap-4
            rounded-3xl bg-white overflow-hidden          "
          style={{
            color: "var(--card-text)",
            outline: "1px solid color-mix(in srgb, var(--foreground) 5%, transparent)",
            boxShadow: isHovered
              ? "0px 20px 40px rgba(18, 20, 25, 0.07)"
              : "0px 20px 40px transparent",
            transition: "box-shadow 0.4s ease-out",
          }}
          initial={false}
          animate={{
            top: isHovered ? 0 : 8,
            left: isHovered ? 0 : 8,
            right: isHovered ? 0 : 8,
            bottom: isHovered ? 0 : 8,
            paddingLeft: isHovered ? 48 : 40,
            paddingTop: isHovered ? 48 : 40,
            paddingBottom: isHovered ? 48 : 40,
            paddingRight: 0,
          }}
          transition={springTransition}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left column — content */}
          <div className="flex flex-col justify-between w-[200px] shrink-0">
            {/* Top: company section + bullets */}
            <div className="flex flex-col gap-6">
              {/* Company section: logo + info */}
              <div className="flex flex-col gap-3">
                <Image
                  src={project.logoSrc}
                  alt={`${project.company} logo`}
                  width={40}
                  height={40}
                  className="rounded-xl"
                />
                <div className="flex flex-col gap-1">
                  <h3 className="font-sans text-[32px] leading-[40px] font-semibold text-card-text pb-1">
                    {project.company}
                  </h3>
                  <p className="font-sans text-base leading-6 font-medium text-card-text">
                    {project.jobTitle}
                  </p>
                  <span className="font-tag text-xs leading-4 font-medium uppercase tracking-[0.03em] opacity-70 text-card-text">
                    {project.date}
                  </span>
                </div>
              </div>

              {/* Bullet list */}
              <ul className="flex flex-col opacity-60">
                {project.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-baseline gap-1">
                    <span className="font-sans text-base leading-6 text-card-text">•</span>
                    <span className="font-sans text-sm leading-6 text-card-text">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Button — icon only */}
            <button
              className="flex items-center justify-center w-12 h-12 rounded-xl cursor-pointer"
              style={{
                backgroundColor: isHovered
                  ? "color-mix(in srgb, var(--card-text) 4%, transparent)"
                  : "transparent",
                backdropFilter: isHovered ? "blur(10px)" : "none",
                transition: "background-color 0.3s ease-out, backdrop-filter 0.3s ease-out",
              }}
            >
              <ExpandIcon size={24} />
            </button>
          </div>

          {/* Right column — images */}
          <div className="flex-1 relative rounded-xl overflow-visible flex items-center justify-center">
            {project.images.map((img, i) => (
              <CardImage key={i} image={img} isHovered={isHovered} />
            ))}
          </div>
        </motion.article>
      </div>
    </div>
  );
}

function CardImage({ image, isHovered }: { image: ProjectImage; isHovered: boolean }) {
  const state = isHovered ? image.hover : image.idle;

  return (
    <motion.div
      className="absolute"
      style={{
        width: image.width,
        height: image.height,
        top: "50%",
        left: image.idle.x.includes("-50%") ? "50%" : 0,
        borderRadius: image.borderRadius,
        overflow: "hidden",
        boxShadow: image.shadow,
      }}
      animate={{
        rotate: state.rotate,
        x: state.x,
        y: state.y,
      }}
      transition={springTransition}
    >
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}

/* ─── Mobile Card ─── */

function ProjectCardMobile({ project }: ProjectCardProps) {
  return (
    <article
      className="relative flex flex-col gap-3 w-full rounded-3xl bg-white overflow-clip"
      style={{
        padding: "24px 24px 0 24px",
        height: 600,
        color: "var(--card-text)",
        outline: "1px solid color-mix(in srgb, var(--foreground) 5%, transparent)",
      }}
    >
      {/* Header: logo + title + date */}
      <div className="flex flex-col gap-3">
        <Image
          src={project.logoSrc}
          alt={`${project.company} logo`}
          width={40}
          height={40}
          className="rounded-xl"
        />
        <div className="flex flex-col gap-1">
          <p className="font-sans text-base leading-6 font-medium text-card-text">
            {project.jobTitle}
          </p>
          <span className="font-tag text-xs leading-4 font-medium uppercase tracking-[0.03em] opacity-70 text-card-text">
            {project.date}
          </span>
        </div>
      </div>

      {/* Image container — fills remaining space */}
      <div className="flex-1 relative rounded-xl overflow-hidden">
        <Image
          src={project.mobileImageSrc}
          alt={project.mobileImageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw"
        />
      </div>

      {/* Button — top right, idle state only */}
      <button
        className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl cursor-pointer"
        style={{
          backdropFilter: "blur(10px)",
          color: "var(--card-text)",
        }}
      >
        <ExpandIcon size={24} />
      </button>
    </article>
  );
}

/* ─── Responsive Wrapper ─── */

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <>
      <div className="hidden lg:block cursor-pointer" onClick={onClick}>
        <ProjectCardDesktop project={project} />
      </div>
      <div className="lg:hidden cursor-pointer" onClick={onClick}>
        <ProjectCardMobile project={project} />
      </div>
    </>
  );
}
