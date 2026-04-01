"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ColorSlider } from "./color-slider";
import { hexToOklch, oklchToHex } from "@/lib/oklab";
import { contrastRatio } from "@/lib/contrast";

const ACCENT_COLORS = [
  "#06E979", // green
  "#FF3F8E", // pink
  "#7B61FF", // purple
  "#4DC9F0", // cyan
  "#2E1B69", // dark indigo
];

// Exact hue gradient from Paper Design (oklab stops)
const HUE_GRADIENT =
  "linear-gradient(in oklab 180deg, oklab(63.5% 0.245 0.068) 0%, oklab(67% 0.275 -0.085) 9.88%, oklab(65.6% 0.244 -0.195) 19.55%, oklab(45.3% -0.029 -0.311) 32.75%, oklab(84.9% -0.129 -0.069) 46.16%, oklab(87.8% -0.203 0.108) 58.66%, oklab(88.8% -0.175 0.036) 71.69%, oklab(95.6% -0.064 0.196) 85.85%)";

const fadeBlurIn = {
  initial: { opacity: 0, filter: "blur(5px)", x: -12 },
  animate: { opacity: 1, filter: "blur(0px)", x: 0 },
  exit: { opacity: 0, filter: "blur(5px)", x: -12 },
};

const fadeBlurTransition = {
  type: "spring" as const,
  stiffness: 350,
  damping: 25,
  delay: 0.08,
};

interface ColorPickerPanelProps {
  color: string;
  foreground: string;
  pickerBg: string;
  pickerFg: string;
  onChange: (hex: string) => void;
  onPresetClick: (hex: string) => void;
  activeColor: string;
  getDotBorder: (color: string, isSelected: boolean) => string;
  selectedShadow: string;
  rainbowGradient: string;
  dividerBg: string;
}

export function ColorPickerPanel({
  color,
  foreground,
  pickerBg,
  pickerFg,
  onChange,
  onPresetClick,
  activeColor,
  getDotBorder,
  selectedShadow,
  rainbowGradient,
  dividerBg,
}: ColorPickerPanelProps) {
  const [oklch, setOklch] = useState(() => hexToOklch(color));
  const [hexInput, setHexInput] = useState(color.replace("#", ""));
  const rafRef = useRef(0);
  const isInternalChange = useRef(false);

  // Sync oklch only when color changes from OUTSIDE (preset selection)
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    setOklch(hexToOklch(color));
    setHexInput(color.replace("#", ""));
  }, [color]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleLightnessChange = useCallback(
    (v: number) => {
      const newL = v * 0.95;
      const newOklch = { ...oklch, L: newL };
      setOklch(newOklch);
      const hex = oklchToHex(newOklch.L, newOklch.C, newOklch.H);
      setHexInput(hex.replace("#", ""));
      isInternalChange.current = true;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => onChange(hex));
    },
    [oklch, onChange]
  );

  const handleHueChange = useCallback(
    (v: number) => {
      const newH = v * 360;
      const newOklch = { ...oklch, H: newH };
      setOklch(newOklch);
      const hex = oklchToHex(newOklch.L, newOklch.C, newOklch.H);
      setHexInput(hex.replace("#", ""));
      isInternalChange.current = true;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => onChange(hex));
    },
    [oklch, onChange]
  );

  const handleHexSubmit = useCallback(() => {
    const clean = hexInput.replace("#", "");
    if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
      const hex = `#${clean.toUpperCase()}`;
      setOklch(hexToOklch(hex));
      onChange(hex);
    } else {
      setHexInput(color.replace("#", ""));
    }
  }, [hexInput, color, onChange]);

  // Lightness gradient: compute oklab a,b from oklch C,H for CSS
  const lightnessGradient = useMemo(() => {
    const rad = (oklch.H * Math.PI) / 180;
    const a = oklch.C * Math.cos(rad);
    const b = oklch.C * Math.sin(rad);
    return `linear-gradient(in oklab 180deg, oklab(95% ${a.toFixed(3)} ${b.toFixed(3)}) 0%, oklab(0% 0 0) 100%)`;
  }, [oklch.C, oklch.H]);

  // Thumb colors
  const lightnessThumbColor = oklchToHex(oklch.L, oklch.C, oklch.H);
  const hueThumbColor = oklchToHex(0.7, 0.2, oklch.H);

  const contrast = contrastRatio(color, foreground);
  const isDarkPicker = pickerBg === "#0E0E0E";

  // Contrast checker colors from Paper Design
  const contrastChipBg = isDarkPicker ? "#FFFFFF" : "#000000";
  const contrastChipText = isDarkPicker ? "#0E0E0E" : "#FFFFFF";
  const contrastRectBg = isDarkPicker ? "#0E0E0E" : "#FFFFFF";
  const contrastRectRing = isDarkPicker ? "#FFFFFF" : "#000000";

  // Hex input bg from Paper Design
  const hexBg = isDarkPicker ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const hexTextColor = isDarkPicker ? "#FFFFFF" : "#000000";

  // Slider border from Paper Design
  const sliderBorder = isDarkPicker
    ? "1px solid rgba(255,255,255,0.15)"
    : "1px solid rgba(0,0,0,0.1)";

  return (
    <motion.div
      className="flex flex-col w-full h-full"
      style={{ gap: 24 }}
      {...fadeBlurIn}
      transition={fadeBlurTransition}
    >
      {/* Top row: contrast checker + hex input */}
      <div className="flex items-start gap-1" style={{ alignSelf: "stretch" }}>
        {/* Contrast checker — 72×24px pill */}
        <div
          className="flex items-center shrink-0"
          style={{
            width: 72,
            height: 24,
            borderRadius: 8,
            backgroundColor: contrastChipBg,
            padding: "0 4px 0 7px",
            gap: 4,
          }}
        >
          {/* Overlapping color rectangles */}
          <div className="relative shrink-0" style={{ width: 20, height: 20 }}>
            <div
              className="absolute"
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                backgroundColor: contrastRectBg,
                boxShadow: `${contrastRectRing} 0px 0px 0px 2px`,
                top: "50%",
                left: 0,
                transform: "translateY(-50%)",
              }}
            />
            <div
              className="absolute"
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                backgroundColor: color,
                boxShadow: `${contrastRectRing} 0px 0px 0px 2px`,
                top: "50%",
                left: 10,
                transform: "translateY(-50%)",
              }}
            />
          </div>
          <span
            className="font-tag font-medium uppercase"
            style={{
              fontSize: 16,
              lineHeight: "16px",
              letterSpacing: "0.03em",
              color: contrastChipText,
            }}
          >
            {contrast.toFixed(1)}
          </span>
        </div>

        {/* Hex input — split pill */}
        <div className="flex flex-1 items-center" style={{ gap: 1, minWidth: 0 }}>
          {/* Hash segment */}
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 14,
              height: 24,
              borderRadius: "8px 2px 2px 8px",
              backgroundColor: hexBg,
              padding: "0 4px 0 3px",
            }}
          >
            <span
              className="font-tag uppercase"
              style={{
                fontSize: 13,
                fontWeight: 400,
                lineHeight: "16px",
                color: hexTextColor,
                opacity: 0.5,
                width: 8,
              }}
            >
              #
            </span>
          </div>
          {/* Value segment */}
          <input
            type="text"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value.slice(0, 6))}
            onBlur={handleHexSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleHexSubmit()}
            className="font-tag uppercase outline-none bg-transparent flex-1"
            style={{
              height: 24,
              borderRadius: "2px 8px 8px 2px",
              backgroundColor: hexBg,
              padding: "0 4px 0 3px",
              fontSize: 16,
              fontWeight: 500,
              lineHeight: "16px",
              color: hexTextColor,
              minWidth: 0,
            }}
            maxLength={6}
          />
        </div>
      </div>

      {/* Bottom area: sliders + divider + dots */}
      <div className="flex" style={{ gap: 28, justifyContent: "space-between", flex: 1, alignSelf: "stretch" }}>
        {/* Sliders sub-container */}
        <div className="flex" style={{ gap: 24 }}>
          {/* Lightness slider */}
          <ColorSlider
            value={oklch.L / 0.95}
            onChange={handleLightnessChange}
            gradient={lightnessGradient}
            thumbColor={lightnessThumbColor}
            label="Lightness"
            border={sliderBorder}
          />

          {/* Hue slider */}
          <ColorSlider
            value={oklch.H / 360}
            onChange={handleHueChange}
            gradient={HUE_GRADIENT}
            thumbColor={hueThumbColor}
            label="Hue"
            border={sliderBorder}
          />
        </div>

        {/* Divider */}
        <div
          className="self-stretch shrink-0"
          style={{ width: 1, borderRadius: 100, backgroundColor: dividerBg }}
        />

        {/* Dots column */}
        <div className="flex flex-col items-center" style={{ gap: 16, justifyContent: "center" }}>
          {ACCENT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onPresetClick(c)}
              className="cursor-pointer"
              style={{
                backgroundColor: c,
                borderRadius: 8,
                width: 24,
                height: 24,
                boxShadow: "none",
                border: getDotBorder(c, false),
                padding: 0,
              }}
              aria-label={`Select color ${c}`}
            />
          ))}
          <button
            className="cursor-default"
            style={{
              backgroundImage: rainbowGradient,
              borderRadius: 8,
              width: 24,
              height: 24,
              boxShadow: selectedShadow,
              border: "none",
              padding: 0,
            }}
            disabled
            aria-label="Custom color active"
          />
        </div>
      </div>
    </motion.div>
  );
}
