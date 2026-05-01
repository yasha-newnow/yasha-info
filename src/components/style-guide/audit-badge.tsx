export function AuditBadge({ note }: { note: string }) {
  return (
    <span
      className="inline-flex items-center rounded font-tag font-medium text-xs uppercase tracking-[0.03em] px-2 py-0.5"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--foreground) 8%, transparent)",
        color: "var(--foreground)",
      }}
    >
      {note}
    </span>
  );
}
