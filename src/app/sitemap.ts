import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE = "https://bronxhanratty.me";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, priority: 1 },
    { url: `${BASE}/about`, priority: 0.8 },
    { url: `${BASE}/resume`, priority: 0.7 },
    { url: `${BASE}/case-study/yearbook-2025`, priority: 0.9 },
    { url: `${BASE}/case-study/846-am`, priority: 0.9 },
    { url: `${BASE}/case-study/lakewood-ranch-redesign`, priority: 0.9 },
    { url: `${BASE}/case-study/recent-works`, priority: 0.9 },
  ];
}
