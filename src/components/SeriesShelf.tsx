// 홈 상단 시리즈 진입점 — 섹션 제목 줄 오른쪽 "모든 시리즈 보기"(/series) + 최근 시리즈 카드 가로 줄
// 카드는 폭 고정으로 왼쪽부터 채워서 시리즈가 1개여도 늘어나지 않음
// 카드가 넘치면 ScrollFadeRow가 오른쪽 끝에 페이드를 깔아 가로 스크롤 가능함을 알림 (데스크톱·모바일 동일 구조)

import React from "react";
import Link from "next/link";
import type { Series } from "@/types";
import ScrollFadeRow from "@/components/ScrollFadeRow";

interface SeriesShelfProps {
  series: Series[];  // 이미 최근 순으로 잘라서 넘겨받음
}

export default function SeriesShelf({ series }: SeriesShelfProps): React.JSX.Element | null {
  if (series.length === 0) return null;

  return (
    <section className="mb-10" aria-labelledby="series-shelf-title">
      <div className="flex items-baseline justify-between mb-3 font-sans">
        <h2 id="series-shelf-title" className="text-xs font-semibold text-muted">
          시리즈
        </h2>
        <Link
          href="/series"
          className="inline-flex items-center gap-0.5 text-xs text-muted hover:text-accent transition-colors"
        >
          모든 시리즈 보기
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>

      {/* 모바일에서는 좌우 여백까지 스크롤 영역으로 써서 카드가 화면 끝에서 잘려 보이게 (NoteHighlights와 동일) */}
      <div className="-mx-6 sm:mx-0">
        <ScrollFadeRow className="gap-3 px-6 sm:px-0 pb-1">
          {series.map((s) => {
            const latest = s.posts[s.posts.length - 1];
            return (
              <Link
                key={s.name}
                href={`/series/${encodeURIComponent(s.name)}`}
                className="group shrink-0 w-56 bg-surface border border-border rounded-box px-4 py-3 hover:border-accent transition-colors font-sans"
              >
                <p className="text-[15px] font-semibold text-ink leading-snug truncate group-hover:text-accent transition-colors">
                  {s.name}
                </p>
                <p className="text-xs text-subtle mt-1 truncate">
                  <span className="tabular-nums">{s.posts.length}편</span>
                  <span aria-hidden="true"> · </span>
                  최근 {latest.title}
                </p>
              </Link>
            );
          })}
        </ScrollFadeRow>
      </div>
    </section>
  );
}
