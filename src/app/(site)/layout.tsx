// 사이트 공통 레이아웃 — 헤더 + 본문(main) + 푸터
// (site)는 route group: 괄호 폴더는 URL에 나타나지 않고(/posts, /trails 그대로), 그 안의 페이지끼리 이 레이아웃을 공유함
//   Flask로 치면 Blueprint마다 다른 base 템플릿을 쓰는 것과 같음
// 홈 인트로(app/page.tsx)는 이 그룹 밖에 있어서 헤더·푸터 없이 화면 전체를 씀

import React from "react";
import Header from "@/components/Header";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  // 루트 layout의 body가 flex 세로 배치 → main(flex-1)이 남는 높이를 채워 푸터를 화면 아래로 밀어냄
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border mt-16">
        <div className="max-w-[900px] mx-auto px-6 py-8 text-center text-xs text-muted">
          © {new Date().getFullYear()} Lizzie
        </div>
      </footer>
    </>
  );
}
