"use client";

import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";

const NAV_ITEMS = [
  { label: "Works", tag: "& BITS", href: "#works" },
  { label: "About", tag: "WHY / HOW / WHAT", href: "#about" },
  { label: "Contact", tag: "LET'S TALK", href: "#contact" },
];

interface ButtonMenuPrimaryProps {
  variant: "desktop" | "mobile";
  onNavigate?: (href: string) => void;
  itemVariants?: Variants;
  scrollContainer?: React.RefObject<HTMLElement | null>;
  getForcedActive?: () => string | null;
}

function Tag({
  text,
  state,
}: {
  text: string;
  state: "idle" | "hover" | "selected";
}) {
  const isSelected = state === "selected";

  return (
    <span
      className="inline-flex items-start rounded px-1 pt-0.5 font-tag font-semibold text-[16px] leading-[20px] uppercase whitespace-nowrap"
      style={{
        backgroundColor: isSelected ? "var(--accent)" : "var(--foreground)",
        color: isSelected ? "var(--foreground)" : "var(--accent)",
      }}
    >
      {text}
    </span>
  );
}

/* ── Scroll tracking (scroll listener, not IntersectionObserver) ── */

function useActiveSection(
  scrollContainer?: React.RefObject<HTMLElement | null>
) {
  const [activeHref, setActiveHref] = useState<string | null>(null);

  useEffect(() => {
    const container = scrollContainer?.current;
    if (!container) return;

    let rafId = 0;

    function update() {
      const el = scrollContainer?.current;
      if (!el) return;

      const scrollTop = el.scrollTop;
      const viewportMid = scrollTop + el.clientHeight / 3;

      // If near top (Hero visible), no section selected
      const firstSection = el.querySelector(`#${NAV_ITEMS[0].href.slice(1)}`) as HTMLElement | null;
      if (firstSection && scrollTop < firstSection.offsetTop - el.clientHeight / 2) {
        setActiveHref(null);
        return;
      }

      // Find the section whose top is closest to (but above) viewport middle third
      let bestHref: string | null = null;
      for (const item of NAV_ITEMS) {
        const section = el.querySelector(item.href) as HTMLElement | null;
        if (section && section.offsetTop <= viewportMid) {
          bestHref = item.href;
        }
      }

      setActiveHref(bestHref);
    }

    function onScroll() {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    }

    container.addEventListener("scroll", onScroll, { passive: true });
    // Run once on mount to set initial state
    update();

    return () => {
      container.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [scrollContainer]);

  return activeHref;
}

/* ── Programmatic scroll helper ─────────────────── */

function scrollToSection(
  href: string,
  scrollContainer?: React.RefObject<HTMLElement | null>
) {
  const container = scrollContainer?.current;
  if (!container) return;
  const el = container.querySelector(href);
  el?.scrollIntoView({ behavior: "smooth" });
}

/* ── Desktop ────────────────────────────────────── */

function DesktopNav({
  itemVariants,
  scrollContainer,
}: {
  itemVariants?: Variants;
  scrollContainer?: React.RefObject<HTMLElement | null>;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const activeHref = useActiveSection(scrollContainer);
  const Wrapper = itemVariants ? motion.div : "div";

  return (
    <div className="flex flex-col items-start gap-0.5">
      {NAV_ITEMS.map((item, index) => {
        const isHovered = hoveredIndex === index;
        const isSelected = activeHref === item.href;
        const showTag = isHovered || isSelected;

        return (
          <Wrapper
            key={item.label}
            {...(itemVariants ? { variants: itemVariants } : {})}
          >
            <a
              href={item.href}
              className="button-menu-primary-desktop"
              style={
                isSelected
                  ? {
                      backgroundColor: "var(--foreground)",
                      borderRadius: "10px",
                    }
                  : undefined
              }
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(item.href, scrollContainer);
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className="font-sans font-semibold text-2xl leading-8"
                style={{
                  color: isSelected ? "var(--accent)" : undefined,
                }}
              >
                {item.label}
              </span>
              <span
                className="tag-desktop"
                style={{
                  opacity: showTag ? 1 : 0,
                  filter: showTag ? "blur(0px)" : "blur(4px)",
                  transform: showTag ? "translateY(0)" : "translateY(2px)",
                }}
              >
                <Tag
                  text={item.tag}
                  state={isSelected ? "selected" : "hover"}
                />
              </span>
            </a>
          </Wrapper>
        );
      })}
    </div>
  );
}

/* ── Mobile ─────────────────────────────────────── */

function MobileNav({
  onNavigate,
  itemVariants,
  scrollContainer,
  getForcedActive,
}: {
  onNavigate?: (href: string) => void;
  itemVariants?: Variants;
  scrollContainer?: React.RefObject<HTMLElement | null>;
  getForcedActive?: () => string | null;
}) {
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const activeHref = useActiveSection(scrollContainer);
  const Wrapper = itemVariants ? motion.div : "div";

  function getActiveIndex() {
    if (pressedIndex !== null) return pressedIndex;
    // Forced active from nav tap (ref-based, survives AnimatePresence freeze)
    const forced = getForcedActive?.() ?? null;
    const effectiveHref = forced ?? activeHref;
    if (effectiveHref) {
      const idx = NAV_ITEMS.findIndex((item) => item.href === effectiveHref);
      return idx >= 0 ? idx : null;
    }
    return null;
  }

  const resolvedActive = getActiveIndex();

  function isDividerHidden(dividerIndex: number) {
    if (resolvedActive === null) return false;
    return resolvedActive === dividerIndex || resolvedActive === dividerIndex + 1;
  }

  return (
    <div className="flex flex-col">
      {NAV_ITEMS.map((item, index) => {
        const isActive = resolvedActive === index;

        return (
          <Wrapper
            key={item.label}
            {...(itemVariants ? { variants: itemVariants } : {})}
          >
            <button
              className="button-menu-primary-mobile w-full text-left"
              style={
                isActive
                  ? {
                      backgroundColor: "var(--foreground)",
                      boxShadow: "0 0 0 1px var(--foreground)",
                    }
                  : undefined
              }
              onPointerDown={() => setPressedIndex(index)}
              onPointerUp={() => {
                onNavigate?.(item.href);
              }}
              onPointerLeave={() => setPressedIndex(null)}
            >
              <span
                className="font-sans font-semibold text-[40px] leading-[48px]"
                style={{
                  color: isActive ? "var(--accent)" : undefined,
                }}
              >
                {item.label}
              </span>
              <Tag
                text={item.tag}
                state={isActive ? "selected" : "hover"}
              />
            </button>

            {/* Divider (not after last item) */}
            {index < NAV_ITEMS.length - 1 && (
              <div className="px-3">
                <div
                  className="h-px bg-foreground transition-opacity duration-150 ease-out"
                  style={{ opacity: isDividerHidden(index) ? 0 : 0.1 }}
                />
              </div>
            )}
          </Wrapper>
        );
      })}
    </div>
  );
}

/* ── Export ──────────────────────────────────────── */

export function ButtonMenuPrimary({
  variant,
  onNavigate,
  itemVariants,
  scrollContainer,
  getForcedActive,
}: ButtonMenuPrimaryProps) {
  if (variant === "desktop") {
    return (
      <DesktopNav
        itemVariants={itemVariants}
        scrollContainer={scrollContainer}
      />
    );
  }
  return <MobileNav onNavigate={onNavigate} itemVariants={itemVariants} scrollContainer={scrollContainer} getForcedActive={getForcedActive} />;
}
