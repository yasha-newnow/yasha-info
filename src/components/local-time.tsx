"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatedClock, AnimatedGlobe } from "./icons";

function Badge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-tag font-medium text-[12px] uppercase tracking-[0.03em] opacity-70"
      style={{
        padding: "2px 8px 2px 3px",
        backgroundColor:
          "color-mix(in srgb, var(--foreground) 10%, transparent)",
      }}
    >
      {icon}
      {text}
    </span>
  );
}

export function LocalTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Madrid",
      });
      setTime(formatted);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-2 flex-wrap">
      <Badge icon={<AnimatedClock size={16} />} text={`Local time ${time}`} />
      <Badge icon={<AnimatedGlobe size={16} />} text="Valencia. Spain" />
    </div>
  );
}
