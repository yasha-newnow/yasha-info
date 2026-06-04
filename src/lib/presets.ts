/**
 * Single source of truth for the site's accent-color palette.
 *
 * Consumed by:
 * - button-customization.tsx — renders the preset dots
 * - layout.tsx — precomputes each preset's full theme (server) and embeds it
 *   into the pre-paint init script that randomizes the accent on each load
 *
 * Keep `globals.css` (the no-JS fallback: `--accent` / `--foreground` on :root
 * and @property initial-value) in sync with BASE_ACCENT when changing this list.
 */
export const ACCENT_COLORS = [
  "#25FF1C", // green
  "#10A2F9", // blue
  "#3F0071", // purple (dark)
  "#FF008E", // magenta
  "#252525", // near-black (dark)
];

/** Base accent — the no-JS / SSR fallback color (must be one of the presets). */
export const BASE_ACCENT = ACCENT_COLORS[0];
