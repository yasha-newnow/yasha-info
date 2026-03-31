/**
 * Oklch ↔ Hex color conversion utilities.
 * Used for perceptually uniform color picker sliders.
 */

// sRGB → linear RGB
function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// linear RGB → sRGB
function delinearize(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// linear RGB → oklab
function linearRgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}

// oklab → linear RGB
function oklabToLinearRgb(L: number, a: number, b: number): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

// oklab ↔ oklch
function oklabToOklch(L: number, a: number, b: number): { L: number; C: number; H: number } {
  const C = Math.sqrt(a * a + b * b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

function oklchToOklab(L: number, C: number, H: number): [number, number, number] {
  const rad = (H * Math.PI) / 180;
  return [L, C * Math.cos(rad), C * Math.sin(rad)];
}

// Clamp to sRGB gamut by reducing chroma
function gamutClamp(L: number, C: number, H: number): { L: number; C: number; H: number } {
  let lo = 0;
  let hi = C;
  let mid = C;
  for (let i = 0; i < 20; i++) {
    mid = (lo + hi) / 2;
    const [labL, a, b] = oklchToOklab(L, mid, H);
    const [r, g, bl] = oklabToLinearRgb(labL, a, b);
    if (r < -0.001 || r > 1.001 || g < -0.001 || g > 1.001 || bl < -0.001 || bl > 1.001) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return { L, C: lo, H };
}

export function hexToOklch(hex: string): { L: number; C: number; H: number } {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }
  const num = parseInt(clean.substring(0, 6), 16);
  const r = linearize(((num >> 16) & 255) / 255);
  const g = linearize(((num >> 8) & 255) / 255);
  const b = linearize((num & 255) / 255);
  const [labL, labA, labB] = linearRgbToOklab(r, g, b);
  return oklabToOklch(labL, labA, labB);
}

export function oklchToHex(L: number, C: number, H: number): string {
  const clamped = gamutClamp(L, C, H);
  const [labL, a, b] = oklchToOklab(clamped.L, clamped.C, clamped.H);
  const [lr, lg, lb] = oklabToLinearRgb(labL, a, b);
  const r = Math.round(Math.min(1, Math.max(0, delinearize(lr))) * 255);
  const g = Math.round(Math.min(1, Math.max(0, delinearize(lg))) * 255);
  const bl = Math.round(Math.min(1, Math.max(0, delinearize(lb))) * 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1).toUpperCase()}`;
}
