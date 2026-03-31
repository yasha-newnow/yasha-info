"use client";

import { useCallback, useRef } from "react";

interface ColorSliderProps {
  value: number; // 0–1 normalized
  onChange: (v: number) => void;
  gradient: string; // CSS gradient string
  thumbColor: string; // hex color for thumb
  label: string; // aria-label
  border?: string; // CSS border string
}

export function ColorSlider({
  value,
  onChange,
  gradient,
  thumbColor,
  label,
  border = "none",
}: ColorSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const dragging = useRef(false);

  const computeValue = useCallback(
    (clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = 1 - (clientY - rect.top) / rect.height;
      const clamped = Math.min(1, Math.max(0, ratio));
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => onChange(clamped));
    },
    [onChange]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      computeValue(e.clientY);
    },
    [computeValue]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      computeValue(e.clientY);
    },
    [computeValue]
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  // Thumb position: top of track = value 1, bottom = value 0
  const thumbTop = (1 - value) * 100;

  return (
    <div
      ref={trackRef}
      className="relative self-stretch cursor-pointer"
      style={{
        width: 24,
        backgroundImage: gradient,
        backgroundOrigin: "border-box",
        backgroundSize: "100% 100%",
        touchAction: "none",
        borderRadius: 6,
        border,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      tabIndex={0}
    >
      {/* Thumb — 28×8px, overhangs 2px each side (3px with border) */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 28,
          height: 8,
          left: -3,
          right: -3,
          top: `calc(${thumbTop}% - 4px)`,
          borderRadius: 3,
          backgroundColor: thumbColor,
          boxShadow: "#FFFFFF 0px 0px 0px 3px, #0000004D 0px 0px 10px 2px",
        }}
      />
    </div>
  );
}
