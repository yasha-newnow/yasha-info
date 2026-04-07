import type { NextConfig } from "next";
import path from "path";
import os from "os";

const nextConfig: NextConfig = {
  distDir: path.join(os.homedir(), ".cache", "yasha-portfolio-next"),
};

export default nextConfig;
