"use client";

import { useEffect, useState } from "react";
import { ButtonCustomization } from "@/components/button-customization";
import {
  HeroAscii,
  tuningForTheme,
  type ShaderTuning,
} from "@/components/hero-ascii";
import { ShaderTuningPanel } from "@/components/shader-tuning-panel";

export default function ShaderComparePage() {
  const [tuning, setTuning] = useState<ShaderTuning>(() => tuningForTheme(true));

  useEffect(() => {
    const onTheme = (e: Event) => {
      const detail = (e as CustomEvent<{ isLight: boolean }>).detail;
      if (detail) setTuning(tuningForTheme(detail.isLight));
    };
    window.addEventListener("themechange", onTheme);
    return () => window.removeEventListener("themechange", onTheme);
  }, []);

  return (
    <main className="min-h-dvh w-full px-4 py-10 lg:px-10 lg:py-16">
      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
          Shader playground
        </h1>
        <p className="text-base lg:text-lg leading-relaxed opacity-70">
          Tune the ASCII shader live. Pick a preset, drag sliders, switch
          themes via the color picker. When you find a balance you like, hit
          Copy params and paste them back to me.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-12 max-w-[1600px] mx-auto items-start">
        <div className="flex justify-center">
          <HeroAscii
            tuning={tuning}
            className="w-full max-w-[900px] aspect-square"
          />
        </div>
        <div className="lg:sticky lg:top-16">
          <ShaderTuningPanel
            tuning={tuning}
            onTuningChange={setTuning}
            showPresets={false}
          />
        </div>
      </div>

      <ButtonCustomization />
    </main>
  );
}
