import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicit Turbopack root: lock-file auto-detection is unreliable on paths
  // containing non-ASCII characters (the `•` in this project path).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
