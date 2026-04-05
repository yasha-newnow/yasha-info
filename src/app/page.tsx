"use client";

import { useState, useCallback, useRef } from "react";
import { Hero } from "@/components/hero";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { ButtonCustomization } from "@/components/button-customization";
import { WorksSection } from "@/components/works-section";
import { SectionHeader } from "@/components/section-header";
import { sections } from "@/data/navigation";

export default function Home() {
  const [showSidebar, setShowSidebar] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const handleTypingComplete = useCallback(() => {
    setShowSidebar(true);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-dvh px-4 lg:gap-0 relative">
      {/* Mobile Nav — morphing header/menu */}
      <MobileNav show={showSidebar} scrollContainer={mainRef} />

      {/* Desktop Sidebar */}
      <Sidebar show={showSidebar} delay={0} scrollContainer={mainRef} />

      {/* Main Content */}
      <main ref={mainRef} className="flex flex-col flex-1 relative overflow-y-auto scroll-smooth pt-20 lg:pt-0">
        <div className="max-w-[1280px] mx-auto w-full min-h-full">
          <Hero onTypingComplete={handleTypingComplete} />

          <WorksSection />

          <section id={sections[1].id} className="min-h-screen flex flex-col p-6 lg:p-10 pt-20">
            <SectionHeader title={sections[1].title} tag={sections[1].tag} />
            <p className="text-xl max-w-xl opacity-70">About me, my approach, and what drives my work. This is a placeholder section for testing anchor navigation.</p>
          </section>

          <section id={sections[2].id} className="min-h-screen flex flex-col p-6 lg:p-10 pt-20">
            <SectionHeader title={sections[2].title} tag={sections[2].tag} />
            <p className="text-xl max-w-xl opacity-70">Get in touch for collaboration, consulting, or just to say hello. This is a placeholder section for testing anchor navigation.</p>
          </section>
        </div>
      </main>

      {/* Color Switcher — bottom right */}
      <div className="fixed bottom-4 right-4 z-30 flex items-end justify-end">
        <ButtonCustomization />
      </div>
    </div>
  );
}
