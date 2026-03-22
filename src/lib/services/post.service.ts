// 비즈니스 로직 레이어 — Flask의 service 레이어
// repository를 조합하고, 컴포넌트에서 직접 쓰는 인터페이스 제공

import {
  fetchPostPage,
  fetchAllPosts,
  fetchPostDetail,
  fetchPostBySlug,
  fetchPostContent,
} from "@/lib/notion/repository";
import type { Post, PostDetail, PostListPage } from "@/types";

// 페이지네이션 포스트 목록 (홈 카드 그리드, 무한 스크롤)
export async function getPostPage(options: {
  pageSize?: number;
  cursor?: string;
  tag?: string;
}): Promise<PostListPage> {
  return fetchPostPage({ pageSize: options.pageSize ?? 20, ...options });
}

// 메타데이터만 조회 (본문 제외) — 스트리밍 렌더링 시 빠른 첫 화면용
export async function getPost(slug: string): Promise<Post | null> {
  return fetchPostBySlug(slug);
}

// 본문만 조회 — Suspense 안의 PostContent 컴포넌트에서 사용
export async function getPostContent(pageId: string): Promise<string> {
  return fetchPostContent(pageId);
}

export async function getPostDetail(slug: string): Promise<PostDetail | null> {
  return fetchPostDetail(slug);
}

// 정적 경로 생성용 (Next.js generateStaticParams에서 사용)
export async function getAllSlugs(): Promise<string[]> {
  const posts = await fetchAllPosts();
  return posts.map((p) => p.slug);
}

// 이전/다음 포스트 조회 (publishedAt 기준, 목록은 최신순이므로 index+1이 이전글)
export async function getAdjacentPosts(
  slug: string
): Promise<{ prev: Post | null; next: Post | null }> {
  const posts = await fetchAllPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: posts[index + 1] ?? null,  // 더 오래된 글
    next: posts[index - 1] ?? null,  // 더 최신 글
  };
}

// 제목 검색 — Notion이 제목 검색을 미지원하므로 전체 로드 후 필터링
export async function searchPosts(query: string): Promise<Post[]> {
  const posts = await fetchAllPosts();
  const lower = query.toLowerCase();
  return posts.filter((p) => p.title.toLowerCase().includes(lower));
}

// 전체 태그 목록 (중복 제거, 사용 횟수 포함) — 전체 포스트 필요
export async function getAllTags(): Promise<{ name: string; count: number }[]> {
  const posts = await fetchAllPosts();
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
