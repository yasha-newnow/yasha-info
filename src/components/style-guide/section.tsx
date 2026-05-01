import type { ReactNode } from "react";

export function Section({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="flex flex-col gap-6 py-12"
      style={{
        borderTop:
          "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
      }}
    >
      <header className="flex flex-col gap-2">
        <div className="font-sans font-semibold text-2xl leading-8">
          {title}
        </div>
        {description && (
          <p
            className="font-sans text-base leading-6"
            style={{ color: "color-mix(in srgb, var(--foreground) 60%, transparent)" }}
          >
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}
