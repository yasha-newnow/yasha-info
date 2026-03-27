"use client";

import { useState, useEffect } from "react";

interface AnimatedClockProps {
  size?: number;
  className?: string;
}

function getMadridTime() {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Madrid",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const hours = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minutes = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return { hours, minutes };
}

export function AnimatedClock({ size = 20, className }: AnimatedClockProps) {
  const [time, setTime] = useState<{ hours: number; minutes: number } | null>(
    null,
  );

  useEffect(() => {
    setTime(getMadridTime());
    const interval = setInterval(() => {
      setTime(getMadridTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const hours = time?.hours ?? 0;
  const minutes = time?.minutes ?? 0;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      className={className}
    >
      <circle
        cx="10"
        cy="10"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {/* Hour hand — shorter, thicker */}
      <line
        x1="10"
        y1="10"
        x2="10"
        y2="4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        style={{
          transformOrigin: "10px 10px",
          transform: `rotate(${hourDeg}deg)`,
          transition: "transform 0.5s ease-out",
        }}
      />
      {/* Minute hand — longer, thinner */}
      <line
        x1="10"
        y1="10"
        x2="10"
        y2="3"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        style={{
          transformOrigin: "10px 10px",
          transform: `rotate(${minuteDeg}deg)`,
          transition: "transform 0.5s ease-out",
        }}
      />
      {/* Center dot */}
      <circle cx="10" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}
