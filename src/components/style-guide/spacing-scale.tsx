const STEPS = [
  { token: "1", px: 4 },
  { token: "2", px: 8 },
  { token: "3", px: 12 },
  { token: "4", px: 16 },
  { token: "5", px: 20 },
  { token: "6", px: 24 },
  { token: "8", px: 32 },
  { token: "10", px: 40 },
  { token: "12", px: 48 },
  { token: "16", px: 64 },
  { token: "20", px: 80 },
];

export function SpacingScale() {
  return (
    <div className="flex flex-col gap-2">
      <p
        className="font-sans text-base leading-6"
        style={{
          color: "color-mix(in srgb, var(--foreground) 60%, transparent)",
        }}
      >
        Project uses Tailwind&apos;s default 4px scale (no custom <code>--spacing</code> tokens). Common usages: <code>gap-4</code>, <code>p-3</code>, <code>px-10</code>, <code>gap-8</code>.
      </p>
      <div className="flex flex-col gap-1.5 mt-3">
        {STEPS.map((step) => (
          <div key={step.px} className="flex items-center gap-4">
            <div className="w-20 font-mono text-xs leading-4">
              gap-{step.token}
            </div>
            <div className="w-12 font-mono text-xs leading-4 opacity-60">
              {step.px}px
            </div>
            <div
              className="h-3 rounded-sm"
              style={{
                width: step.px,
                backgroundColor: "var(--foreground)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
