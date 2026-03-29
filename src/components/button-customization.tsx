"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaletteIcon } from "./icons";
import { applyTheme, shouldUseDarkMode } from "@/lib/contrast";

const ACCENT_COLORS = [
  "#C5F640", // lime (default) — light mode
  "#FF6B35", // tangerine — light mode
  "#7B61FF", // electric violet — light mode
  "#FF3F8E", // hot pink — light mode
  "#4CC9F0", // sky blue — light mode
  "#2D1B69", // deep purple — dark mode
  "#1A1A2E", // midnight — dark mode
  "#8B0000", // dark red — dark mode
];

interface ButtonCustomizationProps {
  delay?: number;
}

export function ButtonCustomization({
  delay = 3000,
}: ButtonCustomizationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeColor, setActiveColor] = useState(ACCENT_COLORS[0]);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const selectColor = (hex: string) => {
    setActiveColor(hex);
    applyTheme(hex);
    setIsOpen(false);
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Main button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="button-customization"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 15,
          delay: delay / 1000,
        }}
        aria-label="Change accent color"
      >
        <PaletteIcon size={24} />
      </motion.button>

      {/* Level 1: Preset palette panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-full right-0 mb-3 flex gap-2 p-2 rounded-2xl"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--foreground) 90%, transparent)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          >
            {ACCENT_COLORS.map((color, i) => (
              <motion.button
                key={color}
                onClick={() => selectColor(color)}
                className="w-8 h-8 rounded-full border-2 shrink-0 cursor-pointer"
                style={{
                  backgroundColor: color,
                  borderColor:
                    activeColor === color
                      ? "rgba(255,255,255,0.8)"
                      : "transparent",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 25,
                  delay: i * 0.03,
                }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
