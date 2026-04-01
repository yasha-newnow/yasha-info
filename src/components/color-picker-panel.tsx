"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ColorSlider } from "./color-slider";
import { hexToHsl, hslToHex } from "@/lib/color";
import { contrastRatio } from "@/lib/contrast";

const SPECTRUM_GRADIENT = "linear-gradient(to bottom, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)";

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
  dividerBg: string;
}

export function ColorPickerPanel({
  color,
  foreground,
  pickerBg,
  pickerFg,
  onChange,
  dividerBg,
}: ColorPickerPanelProps) {
  const [hsl, setHsl] = useState(() => hexToHsl(color));
  const [hexInput, setHexInput] = useState(color.replace("#", ""));
  const rafRef = useRef(0);
  const isInternalChange = useRef(false);

  // Sync HSL only from EXTERNAL color changes (presets), not from slider round-trips
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    setHsl(hexToHsl(color));
    setHexInput(color.replace("#", ""));
  }, [color]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleLightnessChange = useCallback(
    (v: number) => {
      const newL = v * 100;
      const newHsl = { ...hsl, l: newL };
      setHsl(newHsl);
      const hex = hslToHex(newHsl.h, newHsl.s, newL);
      setHexInput(hex.replace("#", ""));
      isInternalChange.current = true;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => onChange(hex));
    },
    [hsl, onChange]
  );

  const handleHueChange = useCallback(
    (v: number) => {
      const newH = (1 - v) * 360; // invert: slider top=0°, bottom=360°
      const newHsl = { ...hsl, h: newH };
      setHsl(newHsl);
      const hex = hslToHex(newH, newHsl.s, newHsl.l);
      setHexInput(hex.replace("#", ""));
      isInternalChange.current = true;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => onChange(hex));
    },
    [hsl, onChange]
  );

  const handleHexSubmit = useCallback(() => {
    const clean = hexInput.replace("#", "");
    if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
      const hex = `#${clean.toUpperCase()}`;
      setHsl(hexToHsl(hex));
      onChange(hex);
    } else {
      setHexInput(color.replace("#", ""));
    }
  }, [hexInput, color, onChange]);

  const lightnessGradient = useMemo(
    () => `linear-gradient(to bottom, #FFFFFF, ${hslToHex(hsl.h, 100, 50)} 50%, #000000)`,
    [hsl.h]
  );

  const lightnessThumbColor = hslToHex(hsl.h, hsl.s, hsl.l);
  const spectrumThumbColor = hslToHex(hsl.h, 100, 50);

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
                border: isDarkPicker ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.2)",
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
              lineHeight: "24px",
              textAlign: "center",
              color: hexTextColor,
              minWidth: 0,
            }}
            maxLength={6}
          />
        </div>
      </div>

      {/* Bottom area: sliders + divider */}
      <div className="flex" style={{ gap: 24, flex: 1, alignSelf: "stretch" }}>
        {/* Lightness slider */}
        <ColorSlider
          value={Math.min(1, Math.max(0, hsl.l / 100))}
          onChange={handleLightnessChange}
          gradient={lightnessGradient}
          thumbColor={lightnessThumbColor}
          label="Lightness"
          border={sliderBorder}
        />

        {/* Spectrum slider — gradient goes top(0°)→bottom(360°), so invert value */}
        <ColorSlider
          value={Math.min(1, Math.max(0, 1 - hsl.h / 360))}
          onChange={handleHueChange}
          gradient={SPECTRUM_GRADIENT}
          thumbColor={spectrumThumbColor}
          label="Color"
          border={sliderBorder}
        />

        {/* Divider */}
        <div
          className="self-stretch shrink-0"
          style={{ width: 1, borderRadius: 100, backgroundColor: dividerBg }}
        />
      </div>
    </motion.div>
  );
}
