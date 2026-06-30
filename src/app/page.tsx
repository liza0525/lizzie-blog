// 홈 페이지 — 태그 필터 + 글 목록

import React, { Suspense } from "react";
import { getPostPage, getAllTags, searchPosts } from "@/lib/services/post.service";
import TagFilter from "@/components/TagFilter";
import PostGrid from "@/components/PostGrid";
import type { PostListPage } from "@/types";

export const revalidate = 3600;

interface HomePageProps {
  searchParams: Promise<{ tag?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps): Promise<React.JSX.Element> {
  const { tag, q } = await searchParams;

  const [firstPage, tags] = await Promise.all([
    q
      ? searchPosts(q).then((posts): PostListPage => ({ posts, nextCursor: null, hasMore: false }))
      : getPostPage({ pageSize: 10, tag }),
    getAllTags(),
  ]);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      {!q && (
        <Suspense>
          <TagFilter tags={tags} />
        </Suspense>
      )}

      {(tag || q) && (
        <p className="text-sm text-muted mb-6 font-sans">
          {q && <><span className="font-semibold text-ink">&ldquo;{q}&rdquo;</span>{" "}검색 결과{" "}</>}
          {tag && <><span className="font-semibold text-ink">{tag}</span>{" "}태그{" "}</>}
          <span className="text-muted">({firstPage.posts.length}{firstPage.hasMore ? "+" : ""})</span>
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
  );
}
