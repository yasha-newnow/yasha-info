"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo, ArrowUpRight, CopyIcon, PlusIcon } from "./icons";
import { ButtonMenuPrimary } from "./button-menu-primary";
import { ButtonMenuSecondary } from "./button-menu-secondary";
import { LocalTime } from "./local-time";

interface MobileNavProps {
  show?: boolean;
  scrollContainer?: React.RefObject<HTMLElement | null>;
}

/* ── Scroll direction hook ──────────────────────── */

type ScrollDir = "up" | "down" | "top";

function useScrollDirection(
  scrollContainer?: React.RefObject<HTMLElement | null>,
  threshold = 64
): ScrollDir {
  const [direction, setDirection] = useState<ScrollDir>("top");
  const lastTop = useRef(0);
  const downStart = useRef(0);
  const rafId = useRef(0);

  useEffect(() => {
    const el = scrollContainer?.current;
    if (!el) return;

    function update() {
      const top = el!.scrollTop;
      if (top < 10) {
        setDirection("top");
      } else if (top > lastTop.current) {
        if (lastTop.current <= downStart.current) downStart.current = lastTop.current;
        if (top - downStart.current > threshold) setDirection("down");
      } else {
        downStart.current = top;
        setDirection("up");
      }
      lastTop.current = top;
    }

    function onScroll() {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(update);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [scrollContainer, threshold]);

  return direction;
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
    transition: { duration: 0.35, ease: "easeIn" as const },
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
  boxShadow: "0px 4px 15px color-mix(in srgb, var(--shadow-glass-color), transparent)",
};

type NavState = "closed" | "open" | "closing" | "shrinking";

/* ── Component ───────────────────────────────────── */

export function MobileNav({ show = false, scrollContainer }: MobileNavProps) {
  const [state, setState] = useState<NavState>("closed");
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const forcedActiveRef = useRef<string | null>(null);
  const shrinkTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const forcedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const getForcedActive = useCallback(() => forcedActiveRef.current, []);

  // Scroll hide: nav slides up on scroll down, slides back on scroll up
  const scrollDir = useScrollDirection(scrollContainer);
  const ignoreScroll = useRef(false);
  const scrollHidden = scrollDir === "down" && state === "closed" && !ignoreScroll.current;
  const hasAppeared = useRef(false);
  useEffect(() => { if (show) hasAppeared.current = true; }, [show]);

  const isExpanded = state === "open" || state === "closing";
  const showContent = state === "open";

  // When entering "closing" → start shrink after items mostly exited
  // When entering "shrinking" → transition to closed after spring settles
  useEffect(() => {
    if (state === "closing") {
      shrinkTimerRef.current = setTimeout(() => {
        setState("shrinking");
      }, 400);
    } else if (state === "shrinking") {
      shrinkTimerRef.current = setTimeout(() => {
        setState("closed");
      }, 500);
    }
    return () => clearTimeout(shrinkTimerRef.current);
  }, [state]);

  const toggle = useCallback(() => {
    setState((prev) => {
      if (prev === "closed" || prev === "shrinking") return "open";
      if (prev === "open") return "closing";
      return prev;
    });
  }, []);

  const handleContentExitComplete = useCallback(() => {
    // If still in closing (shrink timer hasn't fired yet), force shrink
    setState((prev) => (prev === "closing" ? "shrinking" : prev));
    // Execute pending scroll
    if (pendingScroll) {
      const el = document.querySelector(pendingScroll);
      el?.scrollIntoView({ behavior: "smooth" });
      setPendingScroll(null);
    }
  }, [pendingScroll]);

  // Container is expanded for "open" and "closing", shrinks for "shrinking" and "closed"
  const containerExpanded = state === "open" || state === "closing";

  const handleNavigate = useCallback(
    (href: string) => {
      forcedActiveRef.current = href;  // 1. instant ref update (sync)
      setPendingScroll(href);
      setState("closing");              // 2. triggers render → BP reads ref
      ignoreScroll.current = true;      // 3. ignore programmatic scroll
      clearTimeout(forcedTimerRef.current);
      forcedTimerRef.current = setTimeout(() => {
        forcedActiveRef.current = null;
        ignoreScroll.current = false;
      }, 1500);
    },
    []
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(shrinkTimerRef.current);
      clearTimeout(forcedTimerRef.current);
    };
  }, []);

  return (
    <motion.div
      className="lg:hidden absolute top-4 left-4 right-4 z-40 px-2 rounded-3xl overflow-hidden"
      style={glassStyle}
      initial={{ opacity: 0, y: -20, filter: "blur(5px)" }}
      animate={
        show
          ? {
              opacity: 1,
              y: scrollHidden ? -80 : 0,
              filter: "blur(0px)",
              height: containerExpanded ? "calc(100dvh - 32px)" : 64,
            }
          : { opacity: 0, y: -20, filter: "blur(5px)", height: 64 }
      }
      transition={{
        height: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { type: "spring", visualDuration: 0.4, bounce: 0 },
        y: !hasAppeared.current
          ? { type: "spring", visualDuration: 0.4, bounce: 0 }
          : scrollHidden
            ? { type: "tween", duration: 0.2, ease: [0.23, 1, 0.32, 1] }
            : { type: "spring", stiffness: 300, damping: 25 },
        filter: { type: "spring", visualDuration: 0.4, bounce: 0 },
      }}
    >
      {/* Header row — always visible */}
      <div className="flex items-center justify-between px-2 py-3">
        <motion.button
          onClick={() => {
            if (state === "open") setState("closing");
            ignoreScroll.current = true;
            setTimeout(() => { ignoreScroll.current = false; }, 1500);
            scrollContainer?.current?.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center justify-center w-10 h-10 ml-1 cursor-pointer"
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          aria-label="Scroll to top"
        >
          <Logo size={40} />
        </motion.button>
        <button
          onClick={toggle}
          className="flex items-center justify-center w-10 h-10 p-2 mr-1 cursor-pointer"
          aria-label={containerExpanded ? "Close menu" : "Open menu"}
        >
          <PlusIcon size={24} isOpen={containerExpanded} />
        </button>
      </div>

      {/* Menu content — appears when open, exits before container shrinks */}
      <AnimatePresence onExitComplete={handleContentExitComplete}>
        {showContent && (
          <motion.div
            className="flex flex-col justify-between px-2 pb-4"
            style={{ height: "calc(100% - 64px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{}}
            transition={{ duration: 0.2 }}
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
                onNavigate={handleNavigate}
                itemVariants={fadeInItem}
                scrollContainer={scrollContainer}
                getForcedActive={getForcedActive}
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
