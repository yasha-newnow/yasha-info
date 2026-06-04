"use client";

import { useState } from "react";
import { ButtonCustomizationVariant } from "@/components/button-customization-variants";

const effectNames = [
  "Rainbow Halo", "Neon Gradient Border", "Gradient Dashed Ring"
];

export default function VariantsPage() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={`min-h-screen p-8 transition-colors duration-300 ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-gray-50 text-black'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Button Variants (Top 3)</h1>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              Testing the 3 selected animated effects.
            </p>
          </div>
          
          <button 
            onClick={() => setIsDark(!isDark)} 
            className={`px-6 py-2 rounded-full border text-sm font-medium transition-colors ${
              isDark 
                ? 'bg-white/10 border-white/20 hover:bg-white/20' 
                : 'bg-black/5 border-black/10 hover:bg-black/10'
            }`}
          >
            Toggle {isDark ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => {
            const id = i + 1;
            const title = effectNames[i] || `Effect ${id}`;
            return (
              <div 
                key={id} 
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-colors ${
                  isDark ? 'border-white/10' : 'border-black/10'
                }`}
                style={{ backgroundColor: isDark ? "#2E1B69" : "#06E979" }}
              >
                <div className="h-24 w-24 flex items-center justify-center mb-4">
                  <ButtonCustomizationVariant effectId={id} color={isDark ? "#2E1B69" : "#06E979"} isDark={isDark} />
                </div>
                <div className="text-center">
                  <div className={`text-xs font-mono mb-1 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                    #{id}
                  </div>
                  <div className={`text-sm font-medium leading-tight ${isDark ? 'text-white' : 'text-black'}`}>
                    {title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
