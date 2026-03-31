"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo, ArrowUpRight, CopyIcon, PlusIcon } from "./icons";
import { ButtonMenuPrimary } from "./button-menu-primary";
import { ButtonMenuSecondary } from "./button-menu-secondary";
import { LocalTime } from "./local-time";

interface MobileNavProps {
  show?: boolean;
  scrollContainer?: React.RefObject<HTMLElement | null>;
}

/* ── Animation config ────────────────────────────── */

const GROUP_DELAY = 0.25;
const STAGGER_DELAY = 0.1;
const ITEM_DURATION = 0.3;
const ITEM_Y = 4;

function sectionVariants(groupIndex: number) {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: STAGGER_DELAY,
        delayChildren: groupIndex * GROUP_DELAY,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.03,
        staggerDirection: 1, // top items exit first
      },
    },
  };
}

const fadeInItem = {
  hidden: { opacity: 0, y: ITEM_Y, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: ITEM_DURATION, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(5px)",
    transition: { duration: 0.15, ease: "easeIn" as const }, // faster exit per Emil
  },
};

/* ── Helpers ──────────────────────────────────────── */

function copyEmail() {
  navigator.clipboard.writeText("yashapetrunin@gmail.com");
}

const glassStyle = {
  background:
    "linear-gradient(var(--glass-overlay), var(--glass-overlay)), color-mix(in srgb, var(--accent) 70%, transparent)",
  backdropFilter: "blur(var(--blur-glass))",
  transition: "background 0.5s ease",
};

/* ── Component ───────────────────────────────────── */

export function MobileNav({ show = false, scrollContainer }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <motion.div
      className="lg:hidden absolute top-4 left-4 right-4 z-40 rounded-3xl overflow-hidden"
      style={glassStyle}
      initial={{ opacity: 0, y: -20, filter: "blur(5px)" }}
      animate={
        show
          ? {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              height: isOpen ? "calc(100dvh - 32px)" : 64,
            }
          : { opacity: 0, y: -20, filter: "blur(5px)", height: 64 }
      }
      transition={{
        height: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { type: "spring", visualDuration: 0.4, bounce: 0 },
        y: { type: "spring", visualDuration: 0.4, bounce: 0 },
        filter: { type: "spring", visualDuration: 0.4, bounce: 0 },
      }}
    >
      {/* Header row — always visible */}
      <div className="flex items-center justify-between px-2 py-3">
        <div className="flex items-center justify-center w-10 h-10 ml-1">
          <Logo size={40} />
        </div>
        <button
          onClick={toggle}
          className="flex items-center justify-center w-10 h-10 p-2 mr-1 cursor-pointer"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <PlusIcon size={24} isOpen={isOpen} />
        </button>
      </div>

      {/* Menu content — appears when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="flex flex-col justify-between px-2 pb-4"
            style={{ height: "calc(100% - 64px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Top: Name + Badges (group 0) */}
            <motion.div
              className="flex flex-col gap-4"
              variants={sectionVariants(0)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex flex-col gap-5 px-3">
                <motion.span
                  className="font-handwritten text-[28px] leading-8 font-normal"
                  variants={fadeInItem}
                >
                  Yasha Petrunin
                </motion.span>
                <motion.div variants={fadeInItem}>
                  <LocalTime />
                </motion.div>
              </div>
            </motion.div>

            {/* Navigation (group 1) */}
            <motion.nav
              className="flex flex-col"
              variants={sectionVariants(1)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ButtonMenuPrimary
                variant="mobile"
                onNavigate={(href) => {
                  close();
                  const el = document.querySelector(href);
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                itemVariants={fadeInItem}
                scrollContainer={scrollContainer}
              />
            </motion.nav>

            {/* Links (group 2) */}
            <motion.div
              variants={sectionVariants(2)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ButtonMenuSecondary
                items={[
                  { label: "CV", icon: <ArrowUpRight size={20} />, href: "#" },
                  {
                    label: "LinkedIn",
                    icon: <ArrowUpRight size={20} />,
                    href: "#",
                  },
                  {
                    label: "yashapetrunin@gmail.com",
                    icon: <CopyIcon size={20} />,
                    onClick: copyEmail,
                  },
                ]}
                itemVariants={fadeInItem}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
