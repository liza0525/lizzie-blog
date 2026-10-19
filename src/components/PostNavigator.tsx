// 글 상세 네비게이터 패널 — "시리즈"(다른 글로 이동)와 "목차"(이 글 안에서 이동) 섹션을 위아래로 쌓음
// 데스크톱 사이드바(PostContentClient)와 모바일 바텀시트(TocBottomSheet)가 같은 내용을 쓰도록 공용으로 분리
// 시리즈가 없으면 기존처럼 목차만 레이블 없이 렌더링 — 시리즈 없는 글은 이전과 똑같이 보임

import React from "react";
import type { Heading } from "@/lib/toc";
import type { SeriesPosition } from "@/types";
import SeriesNav from "@/components/SeriesNav";
import TableOfContents from "@/components/TableOfContents";

interface PostNavigatorProps {
  headings: Heading[];
  series: SeriesPosition | null;
  onNavigate?: () => void;
}

export default function PostNavigator({ headings, series, onNavigate }: PostNavigatorProps): React.JSX.Element {
  const hasToc = headings.length > 0;

  if (!series) {
    return <TableOfContents headings={headings} onNavigate={onNavigate} />;
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xs font-semibold text-muted mb-2 font-sans">시리즈</h2>
        <SeriesNav position={series} onNavigate={onNavigate} />
      </section>
      {hasToc && (
        <section className="pt-6 border-t border-border">
          <h2 className="text-xs font-semibold text-muted mb-2 font-sans">목차</h2>
          <TableOfContents headings={headings} onNavigate={onNavigate} />
        </section>
      )}
    </div>
  );
}
