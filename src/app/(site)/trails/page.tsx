// 트레일 목록 페이지 — 전체 트레일을 최근에 새 편이 올라온 순으로 나열
// 데이터는 post.service의 getAllTrails (전체 글 목록을 캐싱해 메모리에서 묶음 — Notion 추가 호출 없음)
// 상단에 글 목록으로 돌아가는 링크 — 트레일 상세의 "‹ 트레일 목록"과 같은 위치·모양

import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllTrails } from "@/lib/services/post.service";
import { postListHref } from "@/lib/postList";
import FormattedDate from "@/components/FormattedDate";

// 홈과 같은 주기로 재생성 — 경로에 한글이 없어 ISR 헤더 문제와 무관
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "트레일",
};

export default async function TrailListPage(): Promise<React.JSX.Element> {
  const allTrails = await getAllTrails();

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <Link
        href={postListHref()}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-10 font-sans"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        글 목록
      </Link>

      <h1 className="text-[26px] font-bold leading-snug text-ink mb-8">트레일</h1>

      {allTrails.length === 0 ? (
        <p className="text-center text-muted py-24">아직 트레일이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border">
          {allTrails.map((trail) => (
            <li key={trail.name}>
              <Link
                href={`/trails/${encodeURIComponent(trail.name)}`}
                className="group block -mx-4 px-4 py-5 hover:bg-surface transition-colors"
              >
                <h2 className="text-[18px] font-semibold text-ink leading-snug mb-1.5 group-hover:text-accent transition-colors">
                  {trail.name}
                </h2>
                <p className="flex items-center gap-2 text-sm text-subtle font-sans">
                  <span className="tabular-nums">{trail.posts.length}편</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    최근 발행 <FormattedDate date={trail.latestPublishedAt} className="tabular-nums" />
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
