"use client";

import React from "react";
import { motion } from "framer-motion";
import { PaletteIcon } from "./icons";

interface VariantProps {
  effectId: number;
  color?: string;
  isDark?: boolean;
}

/**
 * The button itself is ALWAYS static: fixed 64x64, never scaled, translated, or
 * rotated. Every animation lives in ambient layers behind or above the button.
 */
const BaseButton = ({ color = "#C5F640", isDark = false }: any) => {
  const containerBg = isDark ? "#FFFFFF" : "#000000";
  const containerBorder = `1px solid ${isDark ? "#FFFFFF" : "#000000"}`;
  const containerShadow = isDark ? "#0D0D0D33 0px 4px 10px" : "#0D0D0D1F 0px 4px 10px";

  return (
    <div
      className="relative flex items-center justify-center z-10"
      style={{
        width: 64,
        height: 64,
        borderRadius: 24,
        padding: 12,
        backgroundColor: containerBg,
        border: containerBorder,
        boxShadow: containerShadow,
        backdropFilter: "blur(10px)",
      }}
    >
      <PaletteIcon size={24} className="pointer-events-none" style={{ color }} />
    </div>
  );
};

const STAGE = "relative flex items-center justify-center pointer-events-none";
const stageStyle: React.CSSProperties = { width: 140, height: 140 };

const RAINBOW_GRADIENT =
  "conic-gradient(from 0deg, #ff2bd6, #00f0ff, #c6ff00, #ff8a00, #ff2bd6)";

/* ============================================================
   1. Rainbow Halo
   ============================================================ */
const Variant1 = ({ color, isDark }: any) => (
  <div className={STAGE} style={stageStyle}>
    <motion.div 
      animate={{ 
        scale: [0.5, 1.2, 1.2, 0.5], 
        opacity: [0, 0.9, 0.9, 0],
        rotate: [0, 180, 360, 360]
      }} 
      transition={{ 
        repeat: Infinity, 
        duration: 5, 
        times: [0, 0.3, 0.7, 1],
        ease: "easeInOut" 
      }} 
      className="absolute rounded-full pointer-events-none" 
      style={{ 
        width: 100, 
        height: 100, 
        filter: "blur(16px)", 
        background: RAINBOW_GRADIENT 
      }} 
    />
    <BaseButton color={color} isDark={isDark} />
  </div>
);

/* ============================================================
   2. Neon Gradient Border (with glowing shadow & 3px margin)
   ============================================================ */
const Variant2 = ({ color, isDark }: any) => (
  <div className={STAGE} style={stageStyle}>
    <motion.div 
      animate={{ 
        scale: [0.8, 1, 1, 0.8], 
        opacity: [0, 1, 1, 0]
      }} 
      transition={{ 
        repeat: Infinity, 
        duration: 5, 
        times: [0, 0.3, 0.7, 1],
        ease: "easeInOut" 
      }} 
      className="absolute pointer-events-none flex items-center justify-center" 
      style={{ width: 74, height: 74 }} // 64px button + 3px gap + 2px border = 74px
    >
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }} 
        className="absolute inset-0 rounded-[28px]" 
        style={{ 
          background: RAINBOW_GRADIENT,
          padding: 2, // Border width
          boxShadow: "0 0 16px 4px rgba(255, 43, 214, 0.4), 0 0 32px 8px rgba(0, 240, 255, 0.2)" // Neon Magenta/Cyan glow
        }}
      >
        {/* Inner mask to cut out the center, leaving only the border */}
        <div className="w-full h-full rounded-[26px]" style={{ background: isDark ? "#2E1B69" : "#06E979" }} />
      </motion.div>
    </motion.div>
    <BaseButton color={color} isDark={isDark} />
  </div>
);

/* ============================================================
   3. Gradient Dashed Ring
   ============================================================ */
const Variant3 = ({ color, isDark }: any) => (
  <div className={STAGE} style={stageStyle}>
    <motion.div 
      animate={{ 
        scale: [0.5, 1, 1, 0.5], 
        opacity: [0, 1, 1, 0]
      }} 
      transition={{ 
        repeat: Infinity, 
        duration: 5, 
        times: [0, 0.3, 0.7, 1],
        ease: "easeInOut" 
      }} 
      className="absolute pointer-events-none flex items-center justify-center" 
      style={{ width: 90, height: 90 }}
    >
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 6, ease: "linear" }} 
        className="absolute inset-0 rounded-full" 
        style={{ 
          // We use a mask to create the dashed effect over the gradient
          background: RAINBOW_GRADIENT,
          WebkitMaskImage: "repeating-conic-gradient(black 0deg, black 10deg, transparent 10deg, transparent 20deg)",
          WebkitMask: "repeating-conic-gradient(black 0deg, black 10deg, transparent 10deg, transparent 20deg)",
          maskImage: "repeating-conic-gradient(black 0deg, black 10deg, transparent 10deg, transparent 20deg)",
          mask: "repeating-conic-gradient(black 0deg, black 10deg, transparent 10deg, transparent 20deg)",
          padding: 3, // Border width
          WebkitMaskComposite: "destination-in",
          maskComposite: "intersect"
        }}
      >
        {/* Inner mask to cut out the center */}
        <div className="w-full h-full rounded-full" style={{ background: isDark ? "#2E1B69" : "#06E979" }} />
      </motion.div>
    </motion.div>
    <BaseButton color={color} isDark={isDark} />
  </div>
);

const VARIANTS: Record<number, React.FC<any>> = {
  1: Variant1, 
  2: Variant2, 
  3: Variant3, 
};

export const ButtonCustomizationVariant: React.FC<VariantProps> = ({ effectId, color = "#06E979", isDark = false }) => {
  const Component = VARIANTS[effectId];
  if (!Component) return <BaseButton color={color} isDark={isDark} />;
  return <Component color={color} isDark={isDark} />;
};
