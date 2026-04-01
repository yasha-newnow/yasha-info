"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PaletteIcon } from "./icons";
import {
  applyTheme,
  shouldUseDarkMode,
  getPickerBackground,
  getPickerForeground,
} from "@/lib/contrast";
import { ColorPickerPanel } from "./color-picker-panel";

const ACCENT_COLORS = [
  "#06E979", // green
  "#FF3F8E", // pink
  "#7B61FF", // purple
  "#4DC9F0", // cyan
  "#2E1B69", // dark indigo
];

// Exact from Paper Design (oklab stops)
const RAINBOW_GRADIENT =
  "conic-gradient(in oklab from 180deg at 50% 50%, oklab(63.5% 0.245 0.068) 0%, oklab(67% 0.275 -0.085) 9.88%, oklab(65.6% 0.244 -0.195) 19.55%, oklab(45.3% -0.029 -0.311) 32.75%, oklab(84.9% -0.129 -0.069) 46.16%, oklab(87.8% -0.203 0.108) 58.66%, oklab(88.8% -0.175 0.036) 71.69%, oklab(95.6% -0.064 0.196) 85.85%)";

type PickerLevel = "closed" | "presets" | "full";

interface ButtonCustomizationProps {
  delay?: number;
}

// Morphing dimensions per state
const STATE_STYLES = {
  closed: { width: 64, height: 64, borderRadius: 24, padding: 12 },
  presets: { width: 72, height: 272, borderRadius: 28, padding: 24 },
  full: { width: 208, height: 320, borderRadius: 28, padding: 24 },
};

export function ButtonCustomization({
  delay = 3000,
}: ButtonCustomizationProps) {
  const [level, setLevel] = useState<PickerLevel>("closed");
  const [activeColor, setActiveColor] = useState(ACCENT_COLORS[0]);
  const [foreground, setForeground] = useState("#0A0A0A");
  const containerRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const toggle = useCallback(() => {
    setLevel((prev) => (prev === "closed" ? "presets" : "closed"));
  }, []);

  const applyColor = useCallback((hex: string) => {
    setActiveColor(hex);
    applyTheme(hex);
    setForeground(shouldUseDarkMode(hex) ? "#FFFFFF" : "#0A0A0A");
  }, []);

  // STATE 2: apply, stay open
  const selectPresetLevel2 = useCallback(
    (hex: string) => applyColor(hex),
    [applyColor]
  );

  // STATE 3: apply, collapse to presets
  const selectPresetLevel3 = useCallback(
    (hex: string) => {
      applyColor(hex);
      setLevel("presets");
    },
    [applyColor]
  );

  const handlePickerChange = useCallback(
    (hex: string) => applyColor(hex),
    [applyColor]
  );

  // Close on mousedown outside
  useEffect(() => {
    if (level === "closed") return;
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  const isDarkMode = shouldUseDarkMode(activeColor);
  const pickerBg = getPickerBackground(activeColor);
  const pickerFg = getPickerForeground(activeColor);
  const isDarkPicker = pickerBg === "#0E0E0E";

  // Divider color from Paper Design
  const dividerBg = isDarkPicker ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  // Container background: closed = foreground color (button), open = picker bg
  const containerBg = level === "closed"
    ? (isDarkMode ? "#FFFFFF" : "#000000")
    : pickerBg;

  // Container border: closed = same as bg, open = none
  const containerBorder = level === "closed"
    ? `1px solid ${isDarkMode ? "#FFFFFF" : "#000000"}`
    : "none";

  // Container shadow from Paper Design
  const containerShadow = level === "closed"
    ? (isDarkMode
        ? "#0D0D0D33 0px 4px 10px"   // light theme trigger
        : "#0D0D0D1F 0px 4px 10px")  // dark theme trigger
    : level === "presets"
      ? (isDarkPicker
          ? "#0D0D0D1F 0px 4px 10px"   // dark capsule: 12% opacity
          : "#0D0D0D33 0px 4px 10px")  // light capsule: 20% opacity
      : "#0D0D0D33 0px 4px 10px"; // expanded: 20% opacity

  // Icon color from Paper Design
  const iconColor = activeColor;

  // Dot border rules differ per state and theme
  const getDotBorder = useCallback(
    (color: string, isSelected: boolean, inExpanded: boolean) => {
      if (isSelected) return "none";
      if (inExpanded) {
        return isDarkPicker
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,0,0,0.1)";
      }
      // Capsule state
      if (isDarkPicker) return "1px solid rgba(255,255,255,0.1)"; // dark capsule
      return "1px solid rgba(0,0,0,0.2)"; // light capsule
    },
    [isDarkPicker]
  );

  const selectedShadow = "white 0px 0px 0px 3px, rgba(0,0,0,0.3) 0px 0px 10px 1px";

  const dims = STATE_STYLES[level];

  if (!entered) return null;

  return (
    <motion.div
      ref={containerRef}
      className="flex flex-col items-center justify-center cursor-pointer"
      style={{
        position: "relative",
        backgroundColor: containerBg,
        border: containerBorder,
        boxShadow: containerShadow,
        backdropFilter: "blur(10px)",
        overflow: "hidden",
        // Anchor bottom-right: the container grows upward and leftward
        // This is handled by the parent fixed positioning
      }}
      initial={{ scale: 0, opacity: 0, width: 64, height: 64, borderRadius: 24, padding: 12 }}
      animate={{
        scale: 1,
        opacity: 1,
        width: dims.width,
        height: dims.height,
        borderRadius: level === "presets" && isDarkPicker ? 27 : dims.borderRadius,
        padding: dims.padding,
      }}
      whileHover={level === "closed" ? {
        width: 72,
        height: 72,
        borderRadius: isDarkMode ? 24 : 28,
      } : undefined}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        scale: { delay: delay / 1000 },
        opacity: { delay: delay / 1000 },
        width: { type: "spring", stiffness: 400, damping: 28 },
        height: { type: "spring", stiffness: 400, damping: 28 },
        borderRadius: { type: "spring", stiffness: 400, damping: 28 },
        padding: { type: "spring", stiffness: 400, damping: 28 },
      }}
      onClick={level === "closed" ? toggle : undefined}
      aria-label="Change accent color"
    >
      {/* STATE 1: Icon only — no AnimatePresence, container morph handles transition */}
      {level === "closed" && (
        <div className="flex items-center justify-center w-full h-full">
          <PaletteIcon
            size={24}
            className="pointer-events-none"
            style={{ color: iconColor }}
          />
        </div>
      )}

      {/* STATE 2: Dots column — absolutely positioned */}
      {level === "presets" && (
        <motion.div
          key="dots-column"
          className="flex flex-col gap-4 items-center"
          style={{
            position: "absolute",
            right: 24,
            bottom: 24,
          }}
          initial={{ opacity: 0, filter: "blur(5px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(5px)" }}
          transition={{ duration: 0.15 }}
        >
          {ACCENT_COLORS.map((color, i) => (
            <motion.button
              key={color}
              onClick={(e) => {
                e.stopPropagation();
                selectPresetLevel2(color);
              }}
              className="w-6 h-6 shrink-0 cursor-pointer"
              style={{
                backgroundColor: color,
                borderRadius: 8,
                boxShadow:
                  activeColor === color ? selectedShadow : "none",
                border: getDotBorder(color, activeColor === color, false),
              }}
              initial={{ opacity: 0, filter: "blur(5px)", scale: 0.8 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 25,
                delay: i * 0.04,
              }}
              aria-label={`Select color ${color}`}
            />
          ))}

          {/* Rainbow dot → opens full picker */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setLevel("full");
            }}
            className="w-6 h-6 shrink-0 cursor-pointer"
            style={{
              backgroundImage: RAINBOW_GRADIENT,
              borderRadius: 8,
              boxShadow: "none",
              border: getDotBorder("rainbow", false, false),
            }}
            initial={{ opacity: 0, filter: "blur(5px)", scale: 0.8 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 25,
              delay: ACCENT_COLORS.length * 0.04,
            }}
            aria-label="Open color picker"
          />
        </motion.div>
      )}

      {/* STATE 3: Full color picker panel (sliders + divider + dots inside) */}
      {level === "full" && (
        <AnimatePresence mode="wait">
          <ColorPickerPanel
            key="full"
            color={activeColor}
            foreground={foreground}
            pickerBg={pickerBg}
            pickerFg={pickerFg}
            onChange={handlePickerChange}
            onPresetClick={selectPresetLevel3}
            activeColor={activeColor}
            getDotBorder={(c: string, sel: boolean) => getDotBorder(c, sel, true)}
            selectedShadow={selectedShadow}
            rainbowGradient={RAINBOW_GRADIENT}
            dividerBg={dividerBg}
          />
        </AnimatePresence>
      )}
    </motion.div>
  );
}
