// sitemap.xml 자동 생성 — Next.js App Router의 MetadataRoute.Sitemap 규격 사용
// 빌드 시 또는 revalidate 주기마다 /sitemap.xml 경로로 노출됨

import type { MetadataRoute } from "next";
import { fetchAllPosts } from "@/lib/notion/repository";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000";

// ISR: 글 목록 페이지와 동일하게 1시간마다 재생성
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchAllPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...postEntries,
  ];
}
