// 글 목록 페이지(/posts) — 히어로 + 시리즈 카드 + 태그 필터 + 글 목록
// 히어로는 태그를 골라도 계속 보여 주고(태그를 누를 때마다 사라졌다 다시 뜨지 않게), 검색 결과 화면에서만 숨김
// 홈(/)은 헤더 없는 인트로 전용이고, 인트로에서 "Scroll down"로 넘기면 이 페이지로 넘어옴
// 등장 애니메이션(히어로 + 시리즈 → 태그 → 목록)은 페이지를 새로 불러온 뒤 처음 볼 때만 (새로고침하면 다시 재생) — HomeIntroMarker + data-intro
//   인트로에서 넘어올 때는(View Transition을 지원하는 브라우저) 이 등장 대신 IntroStage의 View Transition이 화면 전체를 이어 줌 (히어로로 줄어들기 + 목록이 아래에서 올라오기)
// ListOriginMarker로 "전체 글 목록에서 글을 열었다"는 걸 기록 → 글 상세의 돌아가기 버튼이 이 목록(필터 포함)으로 돌아옴

import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getPostPage, getAllTags, searchPosts, getAllSeries } from "@/lib/services/post.service";
import TagFilter from "@/components/TagFilter";
import PostGrid from "@/components/PostGrid";
import SeriesShelf from "@/components/SeriesShelf";
import ListOriginMarker from "@/components/ListOriginMarker";
import HomeIntroMarker from "@/components/HomeIntroMarker";
import HomeHero from "@/components/HomeHero";
import { HOME_HERO } from "@/lib/config";
import { postListHref } from "@/lib/postList";
import { staggerStyle } from "@/lib/motion";
import type { PostListPage, Series } from "@/types";

// 목록에 노출할 시리즈 카드 수 — 나머지는 "모든 시리즈 보기"(/series)로
const LIST_SERIES_LIMIT = 5;

export const revalidate = 3600;

// 루트 layout의 title 템플릿에 따라 "글 목록 | HAE MU"로 표시
export const metadata: Metadata = {
  title: "글 목록",
};

interface PostListPageProps {
  searchParams: Promise<{ tag?: string; q?: string }>;
}

export default async function PostsPage({ searchParams }: PostListPageProps): Promise<React.JSX.Element> {
  const { tag, q } = await searchParams;

  const [firstPage, tags, recentSeries] = await Promise.all([
    q
      ? searchPosts(q).then((posts): PostListPage => ({ posts, nextCursor: null, hasMore: false }))
      : getPostPage({ pageSize: 10, tag }),
    getAllTags(),
    q ? Promise.resolve<Series[]>([]) : getAllSeries().then((all) => all.slice(0, LIST_SERIES_LIMIT)),
  ]);

  // 돌아가기 버튼이 지금 보고 있는 필터·검색 상태 그대로 돌아오도록 현재 URL을 재구성
  const listHref = postListHref({ tag, q });

  // 등장 순서: 히어로(어절 → 밑줄 → 소개)와 동시에, 아래쪽은 시리즈 줄 → 태그 바 → 글 목록(첫 화면 부분)이 따로 순서대로
  //   목록이 히어로가 끝날 때까지 기다리면 첫 화면이 너무 늦게 채워져서 두 줄기를 같이 시작함
  // 뒤로 가기·태그 클릭으로 다시 그려질 땐 data-intro-seen이 붙어 있어 재생되지 않음
  const showHero = !q;

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12" data-intro>
      <ListOriginMarker href={listHref} label="글 목록" />
      <HomeIntroMarker listHref={listHref} />

      {showHero && <HomeHero copy={HOME_HERO} />}

      {!q && (
        <div className="animate-fade-in" style={staggerStyle(0)}>
          <SeriesShelf series={recentSeries} />
        </div>
      )}

      {!q && (
        <div className="animate-fade-in" style={staggerStyle(1)}>
          <Suspense>
            <TagFilter tags={tags} />
          </Suspense>
        </div>
      )}

      {(tag || q) && (
        <p className="text-sm text-muted mb-6 font-sans">
          {q && <><span className="font-semibold text-ink">&ldquo;{q}&rdquo;</span>{" "}검색 결과{" "}</>}
          {tag && <><span className="font-semibold text-ink">{tag}</span>{" "}태그{" "}</>}
          <span className="text-muted">({firstPage.posts.length}{firstPage.hasMore ? "+" : ""})</span>
        </p>
      )}

      <div className="animate-fade-in" style={staggerStyle(2)}>
        <PostGrid
          initialPosts={firstPage.posts}
          initialCursor={firstPage.nextCursor}
          initialHasMore={firstPage.hasMore}
          tag={tag}
          query={q}
        />
      </div>
    </div>
  );
}
