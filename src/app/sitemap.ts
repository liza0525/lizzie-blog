// sitemap.xml 자동 생성 — Next.js App Router의 MetadataRoute.Sitemap 규격 사용
// 빌드 시 또는 revalidate 주기마다 /sitemap.xml 경로로 노출됨

import type { MetadataRoute } from "next";
import { fetchAllPosts } from "@/lib/notion/repository";
import { getAllTrails } from "@/lib/services/post.service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000";

// ISR: 글 목록 페이지와 동일하게 1시간마다 재생성
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, allTrails] = await Promise.all([fetchAllPosts(), getAllTrails()]);

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // 트레일 페이지 — 소속 글 중 가장 최근 수정 시각을 lastModified로
  const trailEntries: MetadataRoute.Sitemap = allTrails.map((trail) => ({
    url: `${SITE_URL}/trails/${encodeURIComponent(trail.name)}`,
    lastModified: new Date(
      Math.max(...trail.posts.map((p) => new Date(p.updatedAt).getTime()))
    ),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    // 홈(/)은 인트로 전용이라 내용이 거의 안 바뀜 — 새 글이 자주 올라오는 곳은 글 목록(/posts)
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/posts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/trails`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...postEntries,
    ...trailEntries,
  ];
}
