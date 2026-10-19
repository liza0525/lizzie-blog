// 시리즈 목록 페이지 — 전체 시리즈를 최근에 새 편이 올라온 순으로 나열
// 데이터는 post.service의 getAllSeries (전체 글 목록을 캐싱해 메모리에서 묶음 — Notion 추가 호출 없음)

import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllSeries } from "@/lib/services/post.service";
import FormattedDate from "@/components/FormattedDate";

// 홈과 같은 주기로 재생성 — 경로에 한글이 없어 ISR 헤더 문제와 무관
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "시리즈",
};

export default async function SeriesListPage(): Promise<React.JSX.Element> {
  const allSeries = await getAllSeries();

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <h1 className="text-[26px] font-bold leading-snug text-ink mb-8">시리즈</h1>

      {allSeries.length === 0 ? (
        <p className="text-center text-muted py-24">아직 시리즈가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border">
          {allSeries.map((series) => (
            <li key={series.name}>
              <Link
                href={`/series/${encodeURIComponent(series.name)}`}
                className="group block -mx-4 px-4 py-5 hover:bg-surface transition-colors"
              >
                <h2 className="text-[18px] font-semibold text-ink leading-snug mb-1.5 group-hover:text-accent transition-colors">
                  {series.name}
                </h2>
                <p className="flex items-center gap-2 text-sm text-subtle font-sans">
                  <span className="tabular-nums">{series.posts.length}편</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    최근 발행 <FormattedDate date={series.latestPublishedAt} className="tabular-nums" />
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
