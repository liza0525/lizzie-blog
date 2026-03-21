// 비즈니스 로직 레이어 — Flask의 service 레이어
// repository를 조합하고, 컴포넌트에서 직접 쓰는 인터페이스 제공

import {
  fetchPostList,
  fetchPostDetail,
} from "@/lib/notion/repository";
import type { Post, PostDetail } from "@/types";

export async function getPostList(): Promise<Post[]> {
  return fetchPostList();
}

export async function getPostDetail(slug: string): Promise<PostDetail | null> {
  return fetchPostDetail(slug);
}

// 정적 경로 생성용 (Next.js generateStaticParams에서 사용)
export async function getAllSlugs(): Promise<string[]> {
  const posts = await fetchPostList();
  return posts.map((p) => p.slug);
}

// 전체 태그 목록 (중복 제거, 사용 횟수 포함)
export async function getAllTags(): Promise<{ name: string; count: number }[]> {
  const posts = await fetchPostList();
  const countMap = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      countMap.set(tag, (countMap.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(countMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
