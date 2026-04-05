"use client";

import { Drawer } from "vaul";
import Image from "next/image";
import type { Project } from "@/data/projects";

interface ProjectSheetProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectSheet({ project, open, onOpenChange }: ProjectSheetProps) {
  if (!project) return null;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground
      setBackgroundColorOnScale={false}
      direction="bottom"
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-500 data-[state=closed]:opacity-0" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-3xl outline-none"
          style={{ height: "96dvh" }}
        >
          {/* Accessibility — sr-only */}
          <Drawer.Title className="sr-only">{project.company}</Drawer.Title>
          <Drawer.Description className="sr-only">
            {project.jobTitle} · {project.date}
          </Drawer.Description>

          {/* Scrollable content — full width scroll area */}
          <div className="overflow-y-auto flex-1 w-full">
            {/* Drag handle */}
            <Drawer.Handle className="mx-auto mt-3 mb-6" />

            {/* Sticky close button */}
            <div className="sticky top-0 z-10 flex justify-end pointer-events-none px-4">
              <Drawer.Close
                className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--card-text) 4%, transparent)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </Drawer.Close>
            </div>

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
                {project.images.map((img, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={img.width}
                      height={img.height}
                      className="w-full h-auto"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
