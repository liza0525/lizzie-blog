// 글 상세 페이지 라우트 진입 시 표시되는 전체 스켈레톤
// Next.js가 자동으로 Suspense boundary로 감싸줌 — page.tsx의 첫 fetch 동안 표시

import React from "react";

export default function PostLoading(): React.JSX.Element {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-pulse">
      {/* 뒤로가기 */}
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-10" />

      {/* 태그 */}
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-14" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
      </div>

      {/* 제목 */}
      <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
      {/* 설명 */}
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/5 mb-4" />
      {/* 날짜 */}
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-12" />

      {/* 커버 이미지 */}
      <div className="rounded-xl aspect-[12/5] bg-gray-200 dark:bg-gray-700 mb-12" />

      {/* 본문 + TOC */}
      <div className="flex gap-12">
        <div className="flex-1 space-y-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
                i % 5 === 0 ? "h-6 w-2/5" : i % 4 === 3 ? "w-3/4" : "w-full"
              }`}
            />
          ))}
        </div>
        <div className="w-56 shrink-0 hidden xl:flex xl:flex-col gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={`h-3 bg-gray-200 dark:bg-gray-700 rounded ${i % 3 === 0 ? "w-4/5" : "w-3/5"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
