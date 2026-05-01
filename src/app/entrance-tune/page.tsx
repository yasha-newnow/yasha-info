"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDialKit } from "dialkit";
import {
  Hero,
  type EntranceTuning,
  type EntranceEasingKey,
} from "@/components/hero";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { ButtonCustomization } from "@/components/button-customization";

export default function EntranceTunePage() {
  const [replayKey, setReplayKey] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const sidebarDelayRef = useRef(3.2);
  const pickerDelayRef = useRef(4.2);

  const dial = useDialKit(
    "Entrance",
    {
      shader: {
        duration: [1.2, 0.3, 3.0, 0.05],
        delay: [1.5, 0, 3.0, 0.05],
        initialScale: [1.6, 1.0, 2.0, 0.01],
        easing: {
          type: "select" as const,
          options: [
            { value: "easeOutStrong", label: "easeOutStrong (snappy)" },
            { value: "iosDrawer", label: "iOS drawer (cinematic)" },
            { value: "easeInOutCubic", label: "easeInOutCubic (drift)" },
            { value: "sCurve", label: "S-curve (held + fast)" },
          ],
          default: "iosDrawer",
        },
      },
      text: {
        titleDelay: [1.7, 0, 4.0, 0.05],
        descriptionDelay: [2.6, 0, 5.0, 0.05],
      },
      sidebar: {
        sidebarDelay: [3.2, 0, 7.0, 0.1],
      },
      picker: {
        delay: [4.2, 0, 7.0, 0.1],
        duration: [0.25, 0.1, 1.5, 0.05],
        slideX: [6, 0, 80, 1],
        slideY: [6, 0, 40, 1],
        blur: [5, 0, 30, 1],
      },
      replay: { type: "action" as const, label: "Replay animation" },
    },
    {
      onAction: (path) => {
        if (path === "replay") setReplayKey((k) => k + 1);
      },
    },
  );

  // Snapshot delays so slider drags don't reset already-running timers.
  // New value applies on next Replay.
  sidebarDelayRef.current = dial.sidebar.sidebarDelay;
  pickerDelayRef.current = dial.picker.delay;

  useEffect(() => {
    setShowSidebar(false);
    setShowPicker(false);
    const sidebarTimer = setTimeout(
      () => setShowSidebar(true),
      sidebarDelayRef.current * 1000,
    );
    const pickerTimer = setTimeout(
      () => setShowPicker(true),
      pickerDelayRef.current * 1000,
    );
    return () => {
      clearTimeout(sidebarTimer);
      clearTimeout(pickerTimer);
    };
  }, [replayKey]);

  const entranceTuning: EntranceTuning = {
    duration: dial.shader.duration,
    initialScale: dial.shader.initialScale,
    easing: dial.shader.easing as EntranceEasingKey,
    shaderDelay: dial.shader.delay,
    titleDelay: dial.text.titleDelay,
    descriptionDelay: dial.text.descriptionDelay,
  };

  return (
    <div className="flex flex-col lg:flex-row h-dvh px-4 lg:gap-0 relative">
      <MobileNav show={showSidebar} scrollContainer={mainRef} />
      <Sidebar show={showSidebar} delay={0} scrollContainer={mainRef} />

      <main
        ref={mainRef}
        className="flex flex-col flex-1 relative overflow-y-auto scroll-smooth pt-20 lg:pt-0"
      >
        <div className="max-w-[1280px] mx-auto w-full min-h-full">
          <Hero key={replayKey} entranceTuning={entranceTuning} />
        </div>
      </main>

      <motion.div
        className="fixed bottom-4 right-4 z-30 flex items-end justify-end"
        initial={false}
        animate={
          showPicker
            ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)" }
            : {
                opacity: 0,
                x: dial.picker.slideX,
                y: dial.picker.slideY,
                filter: `blur(${dial.picker.blur}px)`,
              }
        }
        transition={{ duration: dial.picker.duration, ease: "easeOut" }}
        style={{ pointerEvents: showPicker ? "auto" : "none" }}
      >
        <ButtonCustomization />
      </motion.div>
    </div>
  );
}
