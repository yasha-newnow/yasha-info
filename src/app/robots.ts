import type { MetadataRoute } from "next";

const SITE_URL = "https://yasha.info";

// Dev/internal tuning pages — keep them out of search and AI crawls.
const DEV_PATHS = [
  "/entrance-tune",
  "/shader-compare",
  "/color-picker-variants",
  "/style-guide",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DEV_PATHS },
      // Explicitly welcome the major AI crawlers (covered by * too, but documents intent).
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"],
        allow: "/",
        disallow: DEV_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
