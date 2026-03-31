"use client";

import { motion } from "framer-motion";
import { Logo, ArrowUpRight, CopyIcon } from "./icons";
import { ButtonMenuPrimary } from "./button-menu-primary";
import { ButtonMenuSecondary } from "./button-menu-secondary";
import { LocalTime } from "./local-time";

interface SidebarProps {
  show?: boolean;
  delay?: number;
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
};

function copyEmail() {
  navigator.clipboard.writeText("yashapetrunin@gmail.com");
}

export function Sidebar({ show = false, delay = 0, scrollContainer }: SidebarProps) {
  return (
    <motion.aside
      className="hidden lg:flex w-[325px] shrink-0 my-4 rounded-3xl flex-col justify-between relative overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{
        type: "spring",
        visualDuration: 0.4,
        bounce: 0,
        delay: delay / 1000,
      }}
    >
      {/* Glass background */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background:
            "linear-gradient(var(--glass-overlay), var(--glass-overlay)), color-mix(in srgb, var(--accent) 70%, transparent)",
          backdropFilter: "blur(var(--blur-glass))",
          transition: "background 0.5s ease",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full px-3 pt-3 pb-5">
        {/* Top: Logo + Name (group 0) */}
        <motion.div
          className="flex flex-col"
          variants={sectionVariants(0)}
          initial="hidden"
          animate={show ? "visible" : "hidden"}
        >
          <div className="flex flex-col gap-4 p-3">
            <motion.div variants={fadeInItem}>
              <Logo size={40} />
            </motion.div>
            <div className="flex flex-col gap-5">
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
          </div>
        </motion.div>

        {/* Middle: Navigation (group 1) */}
        <motion.nav
          className="flex flex-col"
          variants={sectionVariants(1)}
          initial="hidden"
          animate={show ? "visible" : "hidden"}
        >
          <ButtonMenuPrimary variant="desktop" itemVariants={fadeInItem} scrollContainer={scrollContainer} />
        </motion.nav>

        {/* Bottom: Links (group 2) */}
        <motion.div
          variants={sectionVariants(2)}
          initial="hidden"
          animate={show ? "visible" : "hidden"}
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
    </motion.aside>
  );
}
