import type { MetadataRoute } from "next";
import { calculators } from "@/lib/calculators";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

// 공개(live) 상태인 계산기만 포함. noindex 페이지는 넣지 않는다.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    ...calculators
      .filter((c) => c.status === "live")
      .map((c) => ({
        url: `${SITE_URL}/calculators/${c.slug}/`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
  ];
}
