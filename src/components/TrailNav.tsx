// 글 상세 네비게이터의 트레일 섹션 — 트레일 이름 + 편 목록, 현재 글 하이라이트
// PostNavigator를 통해 데스크톱 사이드바와 모바일 바텀시트에서 공용으로 쓰임
// 현재 글 표시는 TableOfContents의 활성 항목(accent + semibold)과 같은 규칙으로 맞춤

import React from "react";
import Link from "next/link";
import type { TrailPosition } from "@/types";

interface TrailNavProps {
  position: TrailPosition;
  onNavigate?: () => void;  // 바텀시트에서 링크 클릭 시 시트를 닫기 위한 콜백
}

export default function TrailNav({ position, onNavigate }: TrailNavProps): React.JSX.Element {
  const { trail, index: currentIndex } = position;

  return (
    <nav aria-label={`${trail.name} 트레일`}>
      <Link
        href={`/trails/${encodeURIComponent(trail.name)}`}
        onClick={onNavigate}
        className="block text-[13px] font-semibold leading-snug text-ink hover:text-accent transition-colors mb-2 font-sans"
      >
        {trail.name}
        <span className="ml-1.5 font-normal text-subtle tabular-nums">
          {currentIndex + 1}/{trail.posts.length}
        </span>
      </Link>
      <ol className="space-y-0.5">
        {trail.posts.map((post, i) => {
          const isCurrent = i === currentIndex;
          const number = (
            <span className="shrink-0 tabular-nums text-subtle font-normal">{i + 1}</span>
          );
          const rowClass = "flex gap-2 py-1 text-[13px] leading-snug font-sans";

          return (
            <li key={post.id}>
              {isCurrent ? (
                <span aria-current="page" className={`${rowClass} text-accent font-semibold`}>
                  {number}
                  <span className="line-clamp-2">{post.title}</span>
                </span>
              ) : (
                <Link
                  href={`/posts/${encodeURIComponent(post.slug)}`}
                  onClick={onNavigate}
                  className={`${rowClass} text-muted hover:text-ink transition-colors`}
                >
                  {number}
                  <span className="line-clamp-2">{post.title}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
