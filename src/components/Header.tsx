// 전역 헤더 — 블로그 제목(홈 링크), 검색창, 홈 아이콘, 다크모드 토글 포함
// sticky top-0으로 스크롤해도 항상 상단 고정

import React, { Suspense } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import SearchInput from "./SearchInput";

export default function Header(): React.JSX.Element {
  return (
    <header className="bg-bg border-b border-border sticky top-0 z-10">
      <div className="max-w-[900px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-ink hover:text-accent transition-colors"
        >
          Lizzie
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <Suspense>
              <SearchInput />
            </Suspense>
          </div>
          <nav>
            <Link
              href="/"
              aria-label="홈으로"
              className="text-muted hover:text-ink transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
                <path d="M9 21V12h6v9" />
              </svg>
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
