"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PaletteIcon } from "./icons";

const ACCENT_COLORS = [
  "#C5F640", // lime (default)
  "#FF6B35", // tangerine
  "#7B61FF", // electric violet
  "#00D4AA", // mint
  "#FF3F8E", // hot pink
  "#FFD93D", // golden yellow
  "#4CC9F0", // sky blue
  "#FF9F1C", // amber
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
    document.documentElement.style.setProperty(
      "--accent",
      ACCENT_COLORS[nextIndex]
    );
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
