/**
 * WCAG contrast ratio utilities.
 * Used to auto-switch between light/dark foreground based on accent color.
 */

const DARK_FOREGROUND = "#0A0A0A";
const LIGHT_FOREGROUND = "#FFFFFF";
const WCAG_AA_THRESHOLD = 4.5;

export function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace("#", "");
  // Normalize 3-char hex to 6-char
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }
  if (clean.length < 6) clean = clean.padEnd(6, "0");
  const num = parseInt(clean.substring(0, 6), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function srgbChannel(value: number): number {
  const s = value / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(srgbChannel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hex1: string, hex2: string): number {
  const L1 = relativeLuminance(hexToRgb(hex1));
  const L2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Returns true if the accent color needs white foreground (dark mode).
 * Checks WCAG AA contrast ratio against dark text.
 */
export function shouldUseDarkMode(accentHex: string): boolean {
  return contrastRatio(accentHex, DARK_FOREGROUND) < WCAG_AA_THRESHOLD;
}

/**
 * Apply theme based on accent color.
 * Sets --foreground and --glass-overlay CSS variables.
 */
export function applyTheme(accentHex: string): void {
  const darkMode = shouldUseDarkMode(accentHex);
  const root = document.documentElement;

  root.style.setProperty("--accent", accentHex);
  root.style.setProperty(
    "--foreground",
    darkMode ? LIGHT_FOREGROUND : DARK_FOREGROUND
  );
  root.style.setProperty(
    "--glass-overlay",
    darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"
  );
  // Glass card shadow color — inverted: light bg → white glow, dark bg → dark shadow
  root.style.setProperty(
    "--shadow-glass-color",
    darkMode ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.12)"
  );

  window.dispatchEvent(
    new CustomEvent("themechange", { detail: { isLight: !darkMode } })
  );
}

/** Picker uses inverted theme: dark page → light picker, light page → dark picker */
export function getPickerBackground(accentHex: string): string {
  return shouldUseDarkMode(accentHex) ? "#FFFFFF" : "#0E0E0E";
}

export function getPickerForeground(accentHex: string): string {
  return shouldUseDarkMode(accentHex) ? "#0A0A0A" : "#FFFFFF";
}
