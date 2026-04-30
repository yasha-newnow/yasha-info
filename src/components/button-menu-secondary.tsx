"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

interface ButtonMenuItemFeedback {
  label: string;
  icon: ReactNode;
  /** Auto-revert delay in ms. Default 2200. */
  duration?: number;
}

interface ButtonMenuItem {
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Optional post-click swap state. Only one item with feedback can be active at a time. */
  feedback?: ButtonMenuItemFeedback;
}

interface ButtonMenuSecondaryProps {
  items: ButtonMenuItem[];
  itemVariants?: Variants;
}

const TAP_LEAVE_GUARD_MS = 100;
const DEFAULT_FEEDBACK_DURATION_MS = 2200;

export function ButtonMenuSecondary({ items, itemVariants }: ButtonMenuSecondaryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [feedbackIndex, setFeedbackIndex] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingResetRef = useRef(false);
  const clickTimestampRef = useRef<number>(Number.NEGATIVE_INFINITY);
  const finePointerRef = useRef(false);

  useEffect(() => {
    finePointerRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    return () => clearTimeout(timerRef.current);
  }, []);

  function isDividerHidden(dividerIndex: number) {
    if (activeIndex === null) return false;
    return activeIndex === dividerIndex || activeIndex === dividerIndex + 1;
  }

  function handleClick(index: number, item: ButtonMenuItem) {
    item.onClick?.();
    if (!item.feedback) return;
    clickTimestampRef.current = performance.now();
    pendingResetRef.current = false;
    setFeedbackIndex(index);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => setFeedbackIndex(null),
      item.feedback.duration ?? DEFAULT_FEEDBACK_DURATION_MS,
    );
  }

  function handlePointerEnter(index: number) {
    setActiveIndex(index);
    if (pendingResetRef.current && feedbackIndex === index) {
      clearTimeout(timerRef.current);
      pendingResetRef.current = false;
      setFeedbackIndex(null);
    }
  }

  function handlePointerLeave(index: number) {
    setActiveIndex(null);
    if (!finePointerRef.current) return;
    if (
      feedbackIndex === index &&
      performance.now() - clickTimestampRef.current > TAP_LEAVE_GUARD_MS
    ) {
      pendingResetRef.current = true;
    }
  }

  const Wrapper = itemVariants ? motion.div : "div";

  return (
    <div className="flex flex-col">
      {items.map((item, index) => {
        const isFeedback = feedbackIndex === index && Boolean(item.feedback);
        const content = item.feedback ? (
          <SwapContent
            label={item.label}
            icon={item.icon}
            feedback={item.feedback}
            isFeedback={isFeedback}
          />
        ) : (
          <>
            <span className="text-base font-medium leading-6">{item.label}</span>
            {item.icon}
          </>
        );

        return (
          <Wrapper
            key={index}
            {...(itemVariants ? { variants: itemVariants } : {})}
          >
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="button-menu-item"
                onPointerEnter={() => handlePointerEnter(index)}
                onPointerLeave={() => handlePointerLeave(index)}
              >
                {content}
              </a>
            ) : (
              <button
                onClick={() => handleClick(index, item)}
                className="button-menu-item w-full text-left"
                onPointerEnter={() => handlePointerEnter(index)}
                onPointerLeave={() => handlePointerLeave(index)}
              >
                {content}
              </button>
            )}

            {/* Divider (not after last item) */}
            {index < items.length - 1 && (
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

function SwapContent({
  label,
  icon,
  feedback,
  isFeedback,
}: {
  label: string;
  icon: ReactNode;
  feedback: ButtonMenuItemFeedback;
  isFeedback: boolean;
}) {
  return (
    <>
      <span className="grid items-center text-base font-medium leading-6">
        <span
          className="button-menu-item-swap-layer"
          data-hidden={isFeedback}
          aria-hidden={isFeedback}
        >
          {label}
        </span>
        <span
          className="button-menu-item-swap-layer"
          data-hidden={!isFeedback}
          aria-hidden={!isFeedback}
        >
          {feedback.label}
        </span>
      </span>
      <span className="grid h-5 w-5 place-items-center">
        <span
          className="button-menu-item-swap-layer inline-flex items-center justify-center"
          data-hidden={isFeedback}
          aria-hidden={isFeedback}
        >
          {icon}
        </span>
        <span
          className="button-menu-item-swap-layer inline-flex items-center justify-center"
          data-hidden={!isFeedback}
          aria-hidden={!isFeedback}
        >
          {feedback.icon}
        </span>
      </span>
      <span className="sr-only" aria-live="polite">
        {isFeedback ? feedback.label : ""}
      </span>
    </>
  );
}
