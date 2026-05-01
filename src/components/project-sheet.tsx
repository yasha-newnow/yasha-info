"use client";

import { Drawer } from "vaul";
import Image from "next/image";
import type { Project } from "@/data/projects";

interface ProjectSheetProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnimationEnd?: (open: boolean) => void;
}

export function ProjectSheet({ project, open, onOpenChange, onAnimationEnd }: ProjectSheetProps) {
  if (!project) return null;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground
      setBackgroundColorOnScale={false}
      direction="bottom"
      onAnimationEnd={onAnimationEnd}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[40px] overflow-clip outline-none"
          style={{ height: "97dvh" }}
        >
          {/* Accessibility — sr-only */}
          <Drawer.Title className="sr-only">{project.company}</Drawer.Title>
          <Drawer.Description className="sr-only">
            {project.jobTitle} · {project.date}
          </Drawer.Description>

          {/* Scrollable content — fills Drawer.Content; pt-9 preserves visual top spacing
              previously provided by handle's mt-3 + bar + mb-6 ≈ 36px */}
          <div className="absolute inset-0 overflow-y-auto pt-9">
            {/* Content container */}
            <div className="max-w-[1200px] mx-auto w-full px-6 lg:px-10 pb-8">
              {/* Bullets */}
              <ul className="flex flex-col gap-1 mb-8">
                {project.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-baseline gap-2 font-sans text-base text-card-text">
                    <span className="opacity-40">·</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* Image gallery */}
              <div className="flex flex-col gap-6">
                {project.galleryImages.map((img, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={img.width}
                      height={img.height}
                      className="w-full h-auto"
                      {...(i === 0 ? { priority: true } : { loading: "lazy" })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Handle overlay — absolute over scroller; sibling in DOM, so vaul's shouldDrag walk
              from handle target doesn't encounter the scrolled scroller. Drag works at any scroll. */}
          <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-3 pointer-events-none">
            <Drawer.Handle className="pointer-events-auto" />
          </div>

          {/* Close button overlay — desktop only, fixed at 40/40 from top-right corner.
              Absolute (not sticky) avoids scroll-bounce and decouples from scroller's pt-9 padding. */}
          <div className="hidden lg:block absolute top-10 right-10 z-20">
            <Drawer.Close
              aria-label="Close"
              className="flex items-center justify-center w-12 h-12 rounded-xl cursor-pointer transition-colors duration-300"
              style={{
                backdropFilter: "blur(10px)",
                color: "var(--card-text)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--card-text) 4%, transparent)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <svg aria-hidden="true" width="24" height="24" viewBox="0 -960 960 960" fill="currentColor">
                <path d="M256-192.35 192.35-256l224-224-224-224L256-767.65l224 224 224-224L767.65-704l-224 224 224 224L704-192.35l-224-224-224 224Z" />
              </svg>
            </Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
