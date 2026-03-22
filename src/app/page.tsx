// 홈 페이지 — 글 카드 목록 + 태그 사이드바
// ISR: 1시간마다 재생성 (CLAUDE.md 참고)

import React, { Suspense } from "react";
import { getPostPage, getAllTags, searchPosts } from "@/lib/services/post.service";
import TagSidebar from "@/components/TagSidebar";
import SidebarLayout from "@/components/SidebarLayout";
import PostGrid from "@/components/PostGrid";
import type { PostListPage } from "@/types";

export const revalidate = 86400;

interface HomePageProps {
  searchParams: Promise<{ tag?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps): Promise<React.JSX.Element> {
  const { tag, q } = await searchParams;

  // 검색 시: 전체 로드 후 필터 (Notion 제목 검색 미지원)
  // 그 외: 페이지네이션 (20개씩)
  const [firstPage, tags] = await Promise.all([
    q
      ? searchPosts(q).then((posts): PostListPage => ({ posts, nextCursor: null, hasMore: false }))
      : getPostPage({ pageSize: 20, tag }),
    getAllTags(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <SidebarLayout
        sidebar={
          <Suspense>
            <TagSidebar tags={tags} />
          </Suspense>
        }
      >
        <div>
          {(tag || q) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {q && <><span className="font-medium text-gray-900 dark:text-white">"{q}"</span> 검색 결과{" "}</>}
              {tag && <><span className="font-medium text-gray-900 dark:text-white">{tag}</span> 태그{" "}</>}
              <span className="text-gray-400">({firstPage.posts.length}{firstPage.hasMore ? "+" : ""})</span>
            </p>
          )}

          <PostGrid
            initialPosts={firstPage.posts}
            initialCursor={firstPage.nextCursor}
            initialHasMore={firstPage.hasMore}
            tag={tag}
            query={q}
          />
        </div>
      </SidebarLayout>
    </div>
  );
}
