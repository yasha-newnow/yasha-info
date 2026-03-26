"use client";

import { useState, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

interface ButtonMenuItem {
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
}

interface ButtonMenuSecondaryProps {
  items: ButtonMenuItem[];
  itemVariants?: Variants;
}

export function ButtonMenuSecondary({ items, itemVariants }: ButtonMenuSecondaryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function isDividerHidden(dividerIndex: number) {
    if (activeIndex === null) return false;
    if (activeIndex === dividerIndex || activeIndex === dividerIndex + 1) {
      return true;
    }
    return false;
  }

  const Wrapper = itemVariants ? motion.div : "div";

  return (
    <div className="flex flex-col">
      {items.map((item, index) => (
        <Wrapper
          key={item.label}
          {...(itemVariants ? { variants: itemVariants } : {})}
        >
          {/* Button item */}
          {item.href ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="button-menu-item"
              onPointerEnter={() => setActiveIndex(index)}
              onPointerLeave={() => setActiveIndex(null)}
            >
              <span className="text-base font-medium leading-6">{item.label}</span>
              {item.icon}
            </a>
          ) : (
            <button
              onClick={item.onClick}
              className="button-menu-item w-full text-left"
              onPointerEnter={() => setActiveIndex(index)}
              onPointerLeave={() => setActiveIndex(null)}
            >
              <span className="text-base font-medium leading-6">{item.label}</span>
              {item.icon}
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
      ))}
    </div>
  );
}
