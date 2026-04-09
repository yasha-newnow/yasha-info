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

// Updated from Paper Design (7-stop oklab conic)
const RAINBOW_GRADIENT =
  "conic-gradient(in oklab from 180deg at 50% 50%, oklab(62.8% 0.226 0.124) 0%, oklab(69% 0.276 -0.142) 16.82%, oklab(45.4% -0.027 -0.310) 33.16%, oklab(86.3% -0.134 -0.061) 49.22%, oklab(86.6% -0.234 0.179) 67.58%, oklab(96.6% -0.070 0.198) 83.79%, oklab(62.9% 0.223 0.126) 100%)";

type PickerLevel = "closed" | "presets" | "full";

// Morphing dimensions per state
const STATE_STYLES = {
  closed: { width: 64, height: 64, borderRadius: 24, padding: 12 },
  presets: { width: 72, height: 272, borderRadius: 28, padding: 24 },
  full: { width: 208, height: 320, borderRadius: 28, padding: 24 },
};

export function ButtonCustomization() {
  const [level, setLevel] = useState<PickerLevel>("closed");
  const [activeColor, setActiveColor] = useState("#C5F640");
  const [foreground, setForeground] = useState("#0A0A0A");
  const [isHovered, setIsHovered] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset hover when level changes (prevents sticky hover after picker close)
  useEffect(() => { setIsHovered(false); }, [level]);

  const toggle = useCallback(() => {
    setLevel((prev) => (prev === "closed" ? (isCustomColor ? "full" : "presets") : "closed"));
  }, [isCustomColor]);

  const applyColor = useCallback((hex: string) => {
    setActiveColor(hex);
    applyTheme(hex);
    setForeground(shouldUseDarkMode(hex) ? "#FFFFFF" : "#0A0A0A");
  }, []);

  // STATE 2: apply, stay open
  const selectPresetLevel2 = useCallback(
    (hex: string) => {
      applyColor(hex);
      setIsCustomColor(false);
    },
    [applyColor]
  );

  // STATE 3: apply, collapse to presets
  const selectPresetLevel3 = useCallback(
    (hex: string) => {
      applyColor(hex);
      setIsCustomColor(false);
      setLevel("presets");
    },
    [applyColor]
  );

  const handlePickerChange = useCallback(
    (hex: string) => {
      applyColor(hex);
      setIsCustomColor(true);
    },
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
        transition: "background-color 0.5s ease",
        overflow: "hidden",
      }}
      initial={{ opacity: 0, filter: "blur(5px)", x: 4, y: 4, width: 64, height: 64, borderRadius: 24, padding: 12 }}
      animate={{
        opacity: 1,
        filter: "blur(0px)",
        x: 0,
        y: 0,
        width: level === "closed" && isHovered ? 72 : dims.width,
        height: level === "closed" && isHovered ? 72 : dims.height,
        borderRadius: level === "closed" && isHovered
          ? (isDarkMode ? 24 : 28)
          : level === "presets" && isDarkPicker ? 27 : dims.borderRadius,
        padding: dims.padding,
      }}
      onHoverStart={() => level === "closed" && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        opacity: { delay: 0.8 },
        filter: { delay: 0.8 },
        x: { delay: 0.8 },
        y: { delay: 0.8 },
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

      {/* STATE 3: Full color picker panel (sliders + divider) */}
      {level === "full" && (
        <AnimatePresence mode="wait">
          <ColorPickerPanel
            key="full"
            color={activeColor}
            foreground={foreground}
            pickerBg={pickerBg}
            pickerFg={pickerFg}
            onChange={handlePickerChange}
            dividerBg={dividerBg}
          />
        </AnimatePresence>
      )}

      {/* Dots column — shared across STATE 2 and STATE 3, never re-mounts */}
      {level !== "closed" && (
        <div
          className="flex flex-col items-center"
          style={{
            position: "absolute",
            right: 24,
            bottom: 24,
            gap: 16,
          }}
        >
          {ACCENT_COLORS.map((color, i) => (
            <motion.button
              key={color}
              onClick={(e) => {
                e.stopPropagation();
                if (level === "full") {
                  selectPresetLevel3(color);
                } else {
                  selectPresetLevel2(color);
                }
              }}
              className="w-6 h-6 shrink-0 cursor-pointer"
              style={{
                backgroundColor: color,
                borderRadius: 8,
                border: getDotBorder(color, activeColor === color, level === "full"),
              }}
              initial={{ opacity: 0, filter: "blur(5px)", scale: 0.8 }}
              animate={{
                opacity: 1,
                filter: "blur(0px)",
                scale: 1,
                boxShadow:
                  level === "presets" && activeColor === color
                    ? selectedShadow
                    : "white 0px 0px 0px 0px, rgba(0,0,0,0) 0px 0px 10px 1px",
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 25,
                delay: i * 0.04,
                boxShadow: { type: "spring", stiffness: 600, damping: 35, delay: 0 },
              }}
              aria-label={`Select color ${color}`}
            />
          ))}

          {/* Rainbow dot → opens full picker (or disabled if already in full) */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              if (level !== "full") setLevel("full");
            }}
            className="w-6 h-6 shrink-0 cursor-pointer"
            style={{
              background: RAINBOW_GRADIENT,
              borderRadius: 8,
              border: "none",
            }}
            initial={{ opacity: 0, filter: "blur(5px)", scale: 0.8 }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
              boxShadow: level === "full"
                ? `white 0px 0px 0px 3px, rgba(0,0,0,0.3) 0px 0px 10px 1px, inset 0 0 0 0px ${isDarkPicker ? "rgba(255,255,255,0)" : "rgba(0,0,0,0)"}`
                : `white 0px 0px 0px 0px, rgba(0,0,0,0) 0px 0px 10px 1px, inset 0 0 0 1px ${isDarkPicker ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}`,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 25,
              delay: ACCENT_COLORS.length * 0.04,
              boxShadow: { type: "spring", stiffness: 600, damping: 35, delay: 0 },
            }}
            aria-label={level === "full" ? "Custom color active" : "Open color picker"}
          />
        </div>
      )}
    </motion.div>
  );
}
