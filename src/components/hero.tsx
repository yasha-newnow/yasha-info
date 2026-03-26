"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TypeWriter } from "./type-writer";
import { WaveHand } from "./icons";

interface HeroProps {
  onTypingComplete?: () => void;
}

export function Hero({ onTypingComplete }: HeroProps) {
  const [phase, setPhase] = useState(0);
  // 0: typing "Hey", 1: show wave, 2: typing "I'm Yasha.", 3: typing description, 4: done

  const handleHeyComplete = useCallback(() => setPhase(1), []);
  const handleNameComplete = useCallback(() => setPhase(3), []);
  const handleDescComplete = useCallback(() => {
    setPhase(4);
    onTypingComplete?.();
  }, [onTypingComplete]);

  return (
    <div className="flex flex-col justify-end flex-1 min-h-full p-6 pb-24 lg:p-10 lg:pb-10">
      <div className="flex flex-col gap-4">
        {/* Heading */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-5xl lg:text-[64px] font-bold leading-tight lg:leading-[72px]">
              <TypeWriter
                text="Hey"
                speed={120}
                delay={400}
                onComplete={handleHeyComplete}
              />
            </h1>

            {/* Wave hand */}
            {phase >= 1 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 12,
                }}
                onAnimationComplete={() => {
                  if (phase === 1) setPhase(2);
                }}
              >
                <WaveHand size={72} />
              </motion.span>
            )}
          </div>

          {phase >= 2 && (
            <h1 className="text-5xl lg:text-[64px] font-bold leading-tight lg:leading-[72px]">
              <TypeWriter
                text="I'm Yasha."
                speed={80}
                delay={100}
                onComplete={handleNameComplete}
              />
            </h1>
          )}
        </div>

        {/* Description */}
        {phase >= 3 && (
          <p className="text-lg lg:text-xl leading-7 lg:leading-8 max-w-[1003px]">
            <TypeWriter
              text="Designer and educator with two decades of experience specialized in designing products, digital experiences, and building overpowered teams obsessed with craft."
              speed={15}
              delay={0}
              onComplete={handleDescComplete}
            />
          </p>
        )}
      </div>
    </div>
  );
}
