// 홈 페이지 — 글 카드 목록 + 태그 사이드바
// cookies()로 lang 쿠키를 읽어 영어면 포스트 메타데이터(제목/설명)를 번역해서 전달
// revalidate 제거 → cookies() 사용으로 dynamic 렌더링 강제
// 성능은 post.service + translation.service의 unstable_cache로 보장

import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { getPostPage, getAllTags, searchPosts } from "@/lib/services/post.service";
import { translatePostsMeta } from "@/lib/services/translation.service";
import { getLang } from "@/lib/i18n";
import TagSidebar from "@/components/TagSidebar";
import SidebarLayout from "@/components/SidebarLayout";
import PostGrid from "@/components/PostGrid";
import type { PostListPage } from "@/types";

interface HomePageProps {
  searchParams: Promise<{ tag?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps): Promise<React.JSX.Element> {
  const { tag, q } = await searchParams;
  const cookieStore = await cookies();
  const lang = getLang(cookieStore.get("lang")?.value);

  // 검색 시: 전체 로드 후 필터 (Notion 제목 검색 미지원)
  // 그 외: 페이지네이션 (10개씩)
  const [firstPage, tags] = await Promise.all([
    q
      ? searchPosts(q).then((posts): PostListPage => ({ posts, nextCursor: null, hasMore: false }))
      : getPostPage({ pageSize: 10, tag }),
    getAllTags(),
  ]);

  // 영어 요청 시 포스트 제목/설명 번역 (서버 캐시 2시간)
  const posts = lang === "en"
    ? await translatePostsMeta(firstPage.posts)
    : firstPage.posts;

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
              {q && <><span className="font-medium text-gray-900 dark:text-white">"{q}"</span>{" "}{lang === "en" ? "search results" : "검색 결과"}{" "}</>}
              {tag && <><span className="font-medium text-gray-900 dark:text-white">{tag}</span>{" "}{lang === "en" ? "tag" : "태그"}{" "}</>}
              <span className="text-gray-400">({firstPage.posts.length}{firstPage.hasMore ? "+" : ""})</span>
            </p>
          )}

          <PostGrid
            initialPosts={posts}
            initialCursor={firstPage.nextCursor}
            initialHasMore={firstPage.hasMore}
            tag={tag}
            query={q}
            lang={lang}
          />
        </div>
      </SidebarLayout>
    </div>
  );
}
