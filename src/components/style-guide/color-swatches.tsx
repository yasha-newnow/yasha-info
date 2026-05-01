type Swatch = {
  name: string;
  cssVar: string;
  initial: string;
  note?: string;
};

const SWATCHES: Swatch[] = [
  {
    name: "--accent",
    cssVar: "var(--accent)",
    initial: "#C5F640",
    note: "page background; user-customizable via ButtonCustomization",
  },
  {
    name: "--foreground",
    cssVar: "var(--foreground)",
    initial: "#121419",
    note: "text + UI strokes",
  },
  {
    name: "--card-text",
    cssVar: "var(--card-text)",
    initial: "#121419",
    note: "text inside white cards",
  },
  {
    name: "--glass-overlay",
    cssVar: "var(--glass-overlay)",
    initial: "rgba(0, 0, 0, 0.05)",
    note: "darken overlay on glass surfaces",
  },
  {
    name: "--shadow-glass-color",
    cssVar: "var(--shadow-glass-color)",
    initial: "rgba(255, 255, 255, 0.12)",
    note: "white shadow tint on glass",
  },
];

export function ColorSwatches() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {SWATCHES.map((s) => (
        <div
          key={s.name}
          className="flex flex-col gap-3 p-4 rounded-xl"
          style={{
            border:
              "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
          }}
        >
          <div
            className="h-20 rounded-lg"
            style={{
              backgroundColor: s.cssVar,
              border:
                "1px solid color-mix(in srgb, var(--foreground) 8%, transparent)",
            }}
          />
          <div className="flex flex-col gap-0.5">
            <div className="font-mono text-sm leading-5 font-semibold">
              {s.name}
            </div>
            <div
              className="font-mono text-xs leading-4"
              style={{
                color:
                  "color-mix(in srgb, var(--foreground) 60%, transparent)",
              }}
            >
              initial: {s.initial}
            </div>
            {s.note && (
              <div
                className="font-sans text-xs leading-4 mt-1"
                style={{
                  color:
                    "color-mix(in srgb, var(--foreground) 60%, transparent)",
                }}
              >
                {s.note}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
