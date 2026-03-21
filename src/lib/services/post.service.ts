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
