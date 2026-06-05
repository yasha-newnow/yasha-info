import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicit Turbopack root: lock-file auto-detection is unreliable on paths
  // containing non-ASCII characters (the `•` in this project path).
  turbopack: {
    root: __dirname,
  },
  // Keep public/ out of serverless function bundles. The dev-only
  // api/upload-image route references public/images/projects via process.cwd(),
  // which made the file tracer bundle the whole ~377MB public/ dir into the
  // function (353MB > Vercel's 300MB limit) and fail the deploy. Public assets
  // are served statically by the CDN — no function needs them bundled.
  outputFileTracingExcludes: {
    "*": ["public/**"],
  },
  images: {
    // Default deviceSizes jump 2048 → 3840, so a 1200px slot on a 2x screen
    // pulls the heavy 3840 variant. A 2560 step lets next/image serve a
    // right-sized 2x variant (≈half the bytes) for the ≤1280px slots and the
    // lightbox. Source images are capped at 2560px to match (see git history).
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
  },
};

export default nextConfig;
