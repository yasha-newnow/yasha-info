import type { NextConfig } from "next";
import path from "path";
import os from "os";

const nextConfig: NextConfig = {
  // Workaround: Turbopack can't write to paths with non-ASCII chars (• in project path).
  // Only needed for local dev — Vercel builds use default .next
  ...(process.env.VERCEL
    ? {}
    : { distDir: path.join(os.homedir(), ".cache", "yasha-portfolio-next") }),
};

export default nextConfig;
