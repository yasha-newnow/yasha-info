"use client";

import { useState, useCallback, useRef } from "react";
import { Hero } from "@/components/hero";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { ButtonCustomization } from "@/components/button-customization";

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
        <Hero onTypingComplete={handleTypingComplete} />

        {/* Mock sections for anchor navigation */}
        <section id="works" className="min-h-screen flex flex-col p-10 pt-20">
          <h2 className="text-5xl font-bold mb-4">Works & Bits</h2>
          <p className="text-xl max-w-xl opacity-70">Selected projects and experiments. This is a placeholder section for testing anchor navigation.</p>
        </section>

        <section id="about" className="min-h-screen flex flex-col p-10 pt-20">
          <h2 className="text-5xl font-bold mb-4">Why / How / What</h2>
          <p className="text-xl max-w-xl opacity-70">About me, my approach, and what drives my work. This is a placeholder section for testing anchor navigation.</p>
        </section>

        <section id="contact" className="min-h-screen flex flex-col p-10 pt-20">
          <h2 className="text-5xl font-bold mb-4">Let&apos;s Talk</h2>
          <p className="text-xl max-w-xl opacity-70">Get in touch for collaboration, consulting, or just to say hello. This is a placeholder section for testing anchor navigation.</p>
        </section>

      </main>

      {/* Color Switcher — bottom right */}
      <div className="fixed bottom-4 right-4 z-30 flex items-end justify-end">
        <ButtonCustomization />
      </div>
    </div>
  );
}
