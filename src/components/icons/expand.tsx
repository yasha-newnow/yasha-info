"use client";

import { motion } from "framer-motion";

interface ExpandIconProps {
  size?: number;
  isHovered?: boolean;
  className?: string;
}

// Idle: arrows closer to center
const idlePath =
  "M3.5 16.5V12.5H5V15H7.5V16.5H3.5ZM15 7.5V5H12.5V3.5H16.5V7.5H15Z";

// Hover: arrows moved to corners (same size, different position)
const hoverPath =
  "M2.5 17.5V13.5H4V16H6.5V17.5H2.5ZM16 6.5V4H13.5V2.5H17.5V6.5H16Z";

const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

export function ExpandIcon({
  size = 20,
  isHovered = false,
  className,
}: ExpandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <motion.path
        d={idlePath}
        animate={{ d: isHovered ? hoverPath : idlePath }}
        transition={springTransition}
      />
    </svg>
  );
}
