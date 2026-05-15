"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExpandIcon } from "./icons";
import type { CaseCard, CardImage as CardImageData } from "@/data/schemas";
import { Editable } from "./edit-mode/editable";

interface ProjectCardProps {
  card: CaseCard;
  cardIndex: number;
  onClick?: () => void;
  onPrefetch?: () => void;
}

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

/* ─── Desktop Card ─── */

function ProjectCardDesktop({ card, cardIndex, onPrefetch }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const idBase = `caseCards.${cardIndex}`;

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
            outline: "1px solid color-mix(in srgb, var(--card-text) 5%, transparent)",
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
          onMouseEnter={() => { setIsHovered(true); onPrefetch?.(); }}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left column — content */}
          <div className="flex flex-col justify-between w-[200px] shrink-0">
            {/* Top: company section + bullets */}
            <div className="flex flex-col gap-6">
              {/* Company section: logo + info */}
              <div className="flex flex-col gap-3">
                <Image
                  src={card.logoSrc}
                  alt={`${card.company} logo`}
                  width={40}
                  height={40}
                  className="rounded-xl"
                />
                <div className="flex flex-col gap-1">
                  <h3 className="title-lg text-card-text pb-1">
                    <Editable id={`${idBase}.company`} value={card.company} />
                  </h3>
                  <p className="body text-medium text-card-text">
                    <Editable id={`${idBase}.jobTitle`} value={card.jobTitle} />
                  </p>
                  <span className="caption text-secondary text-card-text">
                    <Editable id={`${idBase}.date`} value={card.date} />
                  </span>
                </div>
              </div>

              {/* Bullet list */}
              <ul className="flex flex-col opacity-60">
                {card.bullets.map((bullet, bulletIndex) => (
                  <li key={`${bulletIndex}-${bullet}`} className="flex items-baseline gap-1">
                    <span className="body text-card-text">•</span>
                    <span className="body-sm text-card-text">
                      <Editable id={`${idBase}.bullets.${bulletIndex}`} value={bullet} />
                    </span>
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
            {card.images.map((img, i) => (
              <CardImage key={i} image={img} isHovered={isHovered} />
            ))}
          </div>
        </motion.article>
      </div>
    </div>
  );
}

function CardImage({ image, isHovered }: { image: CardImageData; isHovered: boolean }) {
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

function ProjectCardMobile({ card, cardIndex }: ProjectCardProps) {
  const idBase = `caseCards.${cardIndex}`;
  return (
    <article
      className="relative flex flex-col gap-3 w-full rounded-3xl bg-white overflow-clip"
      style={{
        padding: "24px 24px 0 24px",
        height: 600,
        color: "var(--card-text)",
        outline: "1px solid color-mix(in srgb, var(--card-text) 5%, transparent)",
      }}
    >
      {/* Header: logo + title + date */}
      <div className="flex flex-col gap-3">
        <Image
          src={card.logoSrc}
          alt={`${card.company} logo`}
          width={40}
          height={40}
          className="rounded-xl"
        />
        <div className="flex flex-col gap-1">
          <p className="body text-medium text-card-text">
            <Editable id={`${idBase}.jobTitle`} value={card.jobTitle} />
          </p>
          <span className="caption text-secondary text-card-text">
            <Editable id={`${idBase}.date`} value={card.date} />
          </span>
        </div>
      </div>

      {/* Image container — fills remaining space */}
      <div className="flex-1 relative rounded-xl overflow-hidden">
        <Image
          src={card.mobileImageSrc}
          alt={card.mobileImageAlt}
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

export function ProjectCard({ card, cardIndex, onClick, onPrefetch }: ProjectCardProps) {
  const cursor = onClick ? "cursor-pointer" : "cursor-default";
  return (
    <>
      <div className={`hidden lg:block ${cursor}`} onClick={onClick}>
        <ProjectCardDesktop card={card} cardIndex={cardIndex} onPrefetch={onPrefetch} />
      </div>
      <div className={`lg:hidden ${cursor}`} onClick={onClick}>
        <ProjectCardMobile card={card} cardIndex={cardIndex} />
      </div>
    </>
  );
}
