"use client";

import { motion } from "framer-motion";
import { Logo, PlusIcon } from "./icons";

interface MobileHeaderProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  show?: boolean;
}

export function MobileHeader({ isMenuOpen, onToggleMenu, show }: MobileHeaderProps) {
  return (
    <motion.header
      className="lg:hidden py-3 px-1 rounded-3xl absolute top-4 left-4 right-4 z-30"
      style={{
        background:
          "linear-gradient(var(--glass-overlay), var(--glass-overlay)), color-mix(in srgb, var(--accent) 70%, transparent)",
        backdropFilter: "blur(10px)",
        transition: "background 0.5s ease",
      }}
      initial={{ opacity: 0, y: -20, filter: "blur(5px)" }}
      animate={
        show
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: -20, filter: "blur(5px)" }
      }
      transition={{ type: "spring", visualDuration: 0.4, bounce: 0 }}
    >
      <div className="flex items-center justify-between px-3">
        {/* Logo */}
        <div className="flex items-center justify-center w-10 h-10">
          <Logo size={40} />
        </div>

        {/* Burger / Close */}
        <button
          onClick={onToggleMenu}
          className="flex items-center justify-center w-10 h-10 p-2 cursor-pointer"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <PlusIcon size={24} isOpen={isMenuOpen} />
        </button>
      </div>
    </motion.header>
  );
}
