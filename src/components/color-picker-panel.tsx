"use client";

import { useCallback, useRef, useEffect } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { contrastRatio } from "@/lib/contrast";

interface ColorPickerPanelProps {
  color: string;
  foreground: string;
  onChange: (hex: string) => void;
}

export function ColorPickerPanel({
  color,
  foreground,
  onChange,
}: ColorPickerPanelProps) {
  const rafRef = useRef(0);

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleChange = useCallback(
    (hex: string) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        onChange(hex);
      });
    },
    [onChange]
  );

  const contrast = contrastRatio(color, foreground);
  const isAccessible = contrast >= 4.5;

  return (
    <div className="flex flex-col gap-3 p-3 w-[240px]">
      {/* Color picker (saturation + hue) */}
      <div className="react-colorful-wrapper">
        <HexColorPicker color={color} onChange={handleChange} />
      </div>

      {/* Hex input + Contrast indicator */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 flex-1 rounded-lg px-3 py-1.5"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--accent) 20%, transparent)",
          }}
        >
          <span className="text-xs opacity-50 shrink-0">#</span>
          <HexColorInput
            color={color}
            onChange={handleChange}
            className="bg-transparent text-sm font-mono w-full outline-none"
            style={{ color: "var(--foreground)" }}
            prefixed={false}
          />
        </div>

        {/* Contrast ratio badge */}
        <div
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 shrink-0"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--accent) 20%, transparent)",
          }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: isAccessible ? "#22c55e" : "#ef4444",
            }}
          />
          <span
            className="text-xs font-mono whitespace-nowrap"
            style={{ color: "var(--foreground)" }}
          >
            {contrast.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
