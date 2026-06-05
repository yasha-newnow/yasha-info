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
};

export default nextConfig;
