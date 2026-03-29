"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PaletteIcon } from "./icons";
import { applyTheme } from "@/lib/contrast";

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
  const [colorIndex, setColorIndex] = useState(0);

  const cycleColor = () => {
    const nextIndex = (colorIndex + 1) % ACCENT_COLORS.length;
    setColorIndex(nextIndex);
    applyTheme(ACCENT_COLORS[nextIndex]);
  };

  return (
    <motion.button
      onClick={cycleColor}
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
  );
}
