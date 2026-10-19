// 글 상세 하단 시리즈 카드 — 시리즈 이름·위치 + 시리즈 안 이전편/다음편
// 전체 이전/다음 글(AdjacentPosts) 위에 놓여, 면(surface) 카드로 "다음 편 읽기"를 한 단계 더 강조
// 첫 편/마지막 편에서는 해당 칸을 비워 두어 좌우 위치(이전=왼쪽, 다음=오른쪽)가 항상 고정되게 함

import React from "react";
import Link from "next/link";
import type { Post, SeriesPosition } from "@/types";

interface SeriesPagerProps {
  position: SeriesPosition;
}

export default function SeriesPager({ position }: SeriesPagerProps): React.JSX.Element {
  const { series, index, prev, next } = position;
  const hasPager = prev !== null || next !== null;

  return (
    <section
      aria-label={`${series.name} 시리즈 이동`}
      className="mt-16 bg-surface border border-border rounded-box overflow-hidden font-sans"
    >
      <div className={`flex items-baseline gap-2 px-5 py-4${hasPager ? " border-b border-border" : ""}`}>
        <span className="text-xs font-semibold text-muted shrink-0">시리즈</span>
        <Link
          href={`/series/${encodeURIComponent(series.name)}`}
          className="text-sm font-semibold text-ink hover:text-accent transition-colors truncate"
        >
          {series.name}
        </Link>
        <span className="text-xs text-subtle tabular-nums shrink-0">
          {index + 1}/{series.posts.length}
        </span>
      </div>
      {hasPager && (
        <div className="grid grid-cols-2 divide-x divide-border">
          <PagerLink post={prev} direction="prev" />
          <PagerLink post={next} direction="next" />
        </div>
      )}
    </section>
  );
}

function PagerLink({
  post,
  direction,
}: {
  post: Post | null;
  direction: "prev" | "next";
}): React.JSX.Element {
  // 빈 칸도 div로 남겨 grid 열 위치를 유지
  if (!post) return <div />;

  const isPrev = direction === "prev";
  return (
    <Link
      href={`/posts/${encodeURIComponent(post.slug)}`}
      className={`group flex flex-col gap-1 px-5 py-4 hover:bg-bg transition-colors${
        isPrev ? "" : " items-end text-right"
      }`}
    >
      <span className="text-xs text-muted">{isPrev ? "← 이전편" : "다음편 →"}</span>
      <span className="text-[15px] font-semibold text-ink group-hover:text-accent transition-colors line-clamp-2">
        {post.title}
      </span>
    </Link>
  );
}
