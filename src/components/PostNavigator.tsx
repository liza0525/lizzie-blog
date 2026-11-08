// 글 상세 네비게이터 패널 — "트레일"(다른 글로 이동)과 "목차"(이 글 안에서 이동) 섹션을 위아래로 쌓음
// 데스크톱 사이드바(PostContentClient)와 모바일 바텀시트(TocBottomSheet)가 같은 내용을 쓰도록 공용으로 분리
// 트레일이 없으면 기존처럼 목차만 레이블 없이 렌더링 — 트레일 없는 글은 이전과 똑같이 보임

import React from "react";
import type { Heading } from "@/lib/toc";
import type { TrailPosition } from "@/types";
import TrailNav from "@/components/TrailNav";
import TableOfContents from "@/components/TableOfContents";

interface PostNavigatorProps {
  headings: Heading[];
  trail: TrailPosition | null;
  onNavigate?: () => void;
}

export default function PostNavigator({ headings, trail, onNavigate }: PostNavigatorProps): React.JSX.Element {
  const hasToc = headings.length > 0;

  if (!trail) {
    return <TableOfContents headings={headings} onNavigate={onNavigate} />;
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xs font-semibold text-muted mb-2 font-sans">트레일</h2>
        <TrailNav position={trail} onNavigate={onNavigate} />
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
