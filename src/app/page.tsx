// 홈 페이지 — 태그 필터 + 글 목록
// ListOriginMarker로 "전체 글 목록에서 글을 열었다"는 걸 기록 → 글 상세의 돌아가기 버튼이 이 목록(필터 포함)으로 돌아옴

import React, { Suspense } from "react";
import { getPostPage, getAllTags, searchPosts } from "@/lib/services/post.service";
import TagFilter from "@/components/TagFilter";
import PostGrid from "@/components/PostGrid";
import NoteHighlights from "@/components/NoteHighlights";
import ListOriginMarker from "@/components/ListOriginMarker";
import type { Post, PostListPage } from "@/types";

export const revalidate = 3600;

interface HomePageProps {
  searchParams: Promise<{ tag?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps): Promise<React.JSX.Element> {
  const { tag, q } = await searchParams;

  const [firstPage, tags, noteHighlights] = await Promise.all([
    q
      ? searchPosts(q).then((posts): PostListPage => ({ posts, nextCursor: null, hasMore: false }))
      : getPostPage({ pageSize: 10, tag, type: "essay" }),
    getAllTags(),
    q ? Promise.resolve<Post[]>([]) : getPostPage({ pageSize: 6, type: "note" }).then((p) => p.posts),
  ]);

  // 돌아가기 버튼이 지금 보고 있는 필터·검색 상태 그대로 돌아오도록 현재 URL을 재구성
  const listParams = new URLSearchParams({ ...(tag ? { tag } : {}), ...(q ? { q } : {}) }).toString();
  const listHref = listParams ? `/?${listParams}` : "/";

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <ListOriginMarker href={listHref} label="글 목록" />

      {!q && <NoteHighlights notes={noteHighlights} />}

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
        type="essay"
        query={q}
      />
    </div>
  );
}
