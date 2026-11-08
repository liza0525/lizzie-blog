// 홈 상단 트레일 진입점 — 섹션 제목 줄 오른쪽 "모든 트레일 보기"(/trails) + 최근 트레일 카드 가로 줄
// 카드는 폭 고정으로 왼쪽부터 채워서 트레일이 1개여도 늘어나지 않음
// 카드가 넘치면 ScrollFadeRow가 오른쪽 끝에 페이드를 깔아 가로 스크롤 가능함을 알림 (데스크톱·모바일 동일 구조)
// hover는 색 변화만 (카드 테두리·제목이 accent로) — 디자인 시스템 0.1.0: hover 시 위치 이동·확대·그림자 금지

import React from "react";
import Link from "next/link";
import type { Trail } from "@/types";
import ScrollFadeRow from "@/components/ScrollFadeRow";

interface TrailShelfProps {
  trails: Trail[];  // 이미 최근 순으로 잘라서 넘겨받음
}

export default function TrailShelf({ trails }: TrailShelfProps): React.JSX.Element | null {
  if (trails.length === 0) return null;

  return (
    <section className="mb-10" aria-labelledby="trail-shelf-title">
      <div className="flex items-baseline justify-between mb-3 font-sans">
        <h2 id="trail-shelf-title" className="text-xs font-semibold text-muted">
          트레일
        </h2>
        <Link
          href="/trails"
          className="group inline-flex items-center gap-0.5 text-xs text-muted hover:text-accent transition-colors"
        >
          모든 트레일 보기
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>

      {/* 모바일에서는 좌우 여백까지 스크롤 영역으로 써서 카드가 화면 끝에서 잘려 보이게 */}
      <div className="-mx-6 sm:mx-0">
        <ScrollFadeRow className="gap-3 px-6 sm:px-0 pb-1">
          {trails.map((s) => {
            const latest = s.posts[s.posts.length - 1];
            return (
              <Link
                key={s.name}
                href={`/trails/${encodeURIComponent(s.name)}`}
                className="group shrink-0 w-56 bg-surface border border-border rounded-box px-4 py-3 hover:border-accent transition-colors font-sans"
              >
                <p className="text-[15px] font-semibold text-ink leading-snug truncate transition-colors group-hover:text-accent">
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
