import type { MetadataRoute } from "next";

// Single-page site — case studies open in a drawer, no separate URLs to index.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://yasha-info.vercel.app",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
