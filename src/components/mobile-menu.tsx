"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Logo, ArrowUpRight, CopyIcon, PlusIcon } from "./icons";
import { ButtonMenuPrimary } from "./button-menu-primary";
import { ButtonMenuSecondary } from "./button-menu-secondary";
import { LocalTime } from "./local-time";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  scrollContainer?: React.RefObject<HTMLElement | null>;
}

const GROUP_DELAY = 0.25;
const STAGGER_DELAY = 0.10;
const ITEM_DURATION = 0.30;
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
        staggerDirection: -1,
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
    transition: { duration: 0.2 },
  },
};

function copyEmail() {
  navigator.clipboard.writeText("yashapetrunin@gmail.com");
}

export function MobileMenu({ isOpen, onClose, scrollContainer }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-4 z-40 flex flex-col lg:hidden rounded-3xl overflow-hidden"
          style={{
            background:
              "linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)), color-mix(in srgb, var(--accent) 70%, transparent)",
            backdropFilter: "blur(50px)",
            transition: "background 0.5s ease",
          }}
          initial={{ height: 64, opacity: 0.8 }}
          animate={{ height: "calc(100vh - 32px)", opacity: 1 }}
          exit={{ height: 64, opacity: 0 }}
          transition={{
            height: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
        >
          {/* Content */}
          <div className="flex flex-col justify-between h-full pt-3 pb-7 px-3">
            {/* Top: Logo + Close + Name (group 0) */}
            <motion.div
              className="flex flex-col gap-4"
              variants={sectionVariants(0)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center w-10 h-10">
                  <Logo size={40} />
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-10 h-10 p-2 cursor-pointer"
                  aria-label="Close menu"
                >
                  <PlusIcon size={24} isOpen={true} />
                </button>
              </div>

              {/* Name */}
              <div className="flex flex-col">
                <motion.span
                  className="text-2xl font-bold leading-8"
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
                  onClose();
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
                  { label: "LinkedIn", icon: <ArrowUpRight size={20} />, href: "#" },
                  { label: "yashapetrunin@gmail.com", icon: <CopyIcon size={20} />, onClick: copyEmail },
                ]}
                itemVariants={fadeInItem}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
