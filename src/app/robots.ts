// robots.txt 자동 생성 — /admin 경로를 검색엔진 색인에서 제외
// sitemap 위치도 함께 명시해 크롤러가 자동으로 인식하게 함

import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
