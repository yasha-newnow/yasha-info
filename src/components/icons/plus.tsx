"use client";

import { motion } from "framer-motion";

interface PlusIconProps {
  size?: number;
  isOpen?: boolean;
  className?: string;
}

export function PlusIcon({ size = 24, isOpen = false, className }: PlusIconProps) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      height={size}
      viewBox="0 -960 960 960"
      width={size}
      fill="currentColor"
      className={className}
      animate={{ rotate: isOpen ? 45 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <path d="M437-121.87V-437H121.87v-86H437v-315.13h86V-523h315.13v86H523v315.13h-86Z" />
    </motion.svg>
  );
}
