"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Hero } from "@/components/hero";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { ButtonCustomization } from "@/components/button-customization";
import { WorksSection } from "@/components/works-section";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";

// Shifted by 0.3s along with the rest of entrance timings to accommodate the
// 300ms fade-in lead delay on the shader (see hero.tsx FADE_IN_DELAY_MS).
// Mobile = breakpoints below lg (1024px), where the sidebar collapses into a
// header (MobileNav) and the picker fades in without the desktop sidebar stagger.
const DESKTOP_TIMINGS = { sidebar: 2.6, picker: 3.5 };
const MOBILE_TIMINGS = { sidebar: 2.6, picker: 2.8 };
const PICKER_DURATION = 0.25;
const PICKER_SLIDE_X = 6;
const PICKER_SLIDE_Y = 6;
const PICKER_BLUR = 5;

export default function HomeClient() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setShowSidebar(true);
      setShowPicker(true);
      return;
    }
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    const t = isMobile ? MOBILE_TIMINGS : DESKTOP_TIMINGS;
    const main = mainRef.current;
    if (main) {
      main.style.overflow = "hidden";
      main.style.touchAction = "none";
    }
    const sidebarTimer = setTimeout(
      () => setShowSidebar(true),
      t.sidebar * 1000,
    );
    const pickerTimer = setTimeout(() => {
      setShowPicker(true);
      if (main) {
        main.style.overflow = "";
        main.style.touchAction = "";
      }
    }, t.picker * 1000);
    return () => {
      clearTimeout(sidebarTimer);
      clearTimeout(pickerTimer);
      if (main) {
        main.style.overflow = "";
        main.style.touchAction = "";
      }
    };
  }, [reducedMotion]);

  return (
    <div className="flex flex-col lg:flex-row h-dvh lg:px-4 lg:gap-0 relative">
      <MobileNav show={showSidebar} scrollContainer={mainRef} />
      <Sidebar show={showSidebar} delay={0} scrollContainer={mainRef} />

      <main
        ref={mainRef}
        className="flex flex-col flex-1 relative overflow-y-auto scroll-smooth pt-20 lg:pt-0"
      >
        <div className="max-w-[1280px] mx-auto w-full min-h-full px-4 lg:px-0">
          <Hero />

          <WorksSection scrollContainer={mainRef} />

          <AboutSection />

          <ContactSection />
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
                x: PICKER_SLIDE_X,
                y: PICKER_SLIDE_Y,
                filter: `blur(${PICKER_BLUR}px)`,
              }
        }
        transition={{ duration: PICKER_DURATION, ease: "easeOut" }}
        style={{ pointerEvents: showPicker ? "auto" : "none" }}
      >
        <ButtonCustomization />
      </motion.div>
    </div>
  );
}
