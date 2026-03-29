"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaletteIcon } from "./icons";
import { applyTheme, shouldUseDarkMode } from "@/lib/contrast";
import { ColorPickerPanel } from "./color-picker-panel";

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

type PickerLevel = "closed" | "presets" | "full";

interface ButtonCustomizationProps {
  delay?: number;
}

export function ButtonCustomization({
  delay = 3000,
}: ButtonCustomizationProps) {
  const [level, setLevel] = useState<PickerLevel>("closed");
  const [activeColor, setActiveColor] = useState(ACCENT_COLORS[0]);
  const [foreground, setForeground] = useState("#0A0A0A");
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    setLevel((prev) => (prev === "closed" ? "presets" : "closed"));
  }, []);

  const selectColor = useCallback((hex: string) => {
    setActiveColor(hex);
    applyTheme(hex);
    setForeground(shouldUseDarkMode(hex) ? "#FFFFFF" : "#0A0A0A");
    setLevel("closed");
  }, []);

  const handlePickerChange = useCallback((hex: string) => {
    setActiveColor(hex);
    applyTheme(hex);
    setForeground(shouldUseDarkMode(hex) ? "#FFFFFF" : "#0A0A0A");
  }, []);

  // Close on mousedown outside
  useEffect(() => {
    if (level === "closed") return;
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setLevel("closed");
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [level]);

  // Close on Escape
  useEffect(() => {
    if (level === "closed") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLevel("closed");
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [level]);

  return (
    <div ref={containerRef} className="relative">
      {/* Panel — positioned above the button */}
      <AnimatePresence>
        {level !== "closed" && (
          <motion.div
            className="absolute bottom-full right-0 mb-3 rounded-2xl overflow-hidden"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--foreground) 90%, transparent)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--shadow-l)",
            }}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {/* Level 2: Full color picker */}
            <AnimatePresence>
              {level === "full" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <ColorPickerPanel
                    color={activeColor}
                    foreground={foreground}
                    onChange={handlePickerChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Level 1: Preset palette */}
            <div className="flex gap-2 p-2">
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

              {/* Gradient button → opens Level 2 */}
              <motion.button
                onClick={() =>
                  setLevel((prev) =>
                    prev === "full" ? "presets" : "full"
                  )
                }
                className="w-8 h-8 rounded-full border-2 shrink-0 cursor-pointer"
                style={{
                  background:
                    "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                  borderColor:
                    level === "full"
                      ? "rgba(255,255,255,0.8)"
                      : "transparent",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 25,
                  delay: ACCENT_COLORS.length * 0.03,
                }}
                aria-label="Open color picker"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={toggle}
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
    </div>
  );
}
