// 포스트 우측 목차(TOC) — h1/h2/h3/h4 계층 구조로 렌더링
// IntersectionObserver로 현재 읽고 있는 섹션을 감지해 활성 항목 하이라이팅
// rehype-slug가 생성한 헤딩 id를 앵커로 사용
// onNavigate: 앵커 클릭 시 호출되는 선택적 콜백 — 바텀시트 등 오버레이에서 목차 클릭과 동시에 닫기 위해 사용
// 부드러운 스크롤은 전역 CSS(scroll-behavior) 대신 여기서만 JS로 처리 — 전역으로 켜면 뒤로 가기 스크롤 복원까지 미끄러짐
"use client";

import { useEffect, useState } from "react";
import type React from "react";
import type { Heading } from "@/lib/toc";

// 목차 항목 클릭 → 해당 헤딩으로 부드럽게 이동 (모션 줄이기 설정이면 즉시 이동)
// 헤딩의 scroll-margin-top(globals.css)이 scrollIntoView에도 적용돼 sticky 헤더에 가리지 않음
function scrollToHeading(e: React.MouseEvent<HTMLAnchorElement>, id: string): void {
  const target = document.getElementById(id);
  // 헤딩을 못 찾으면 브라우저 기본 앵커 이동에 맡김
  if (!target) return;

  e.preventDefault();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  // 기본 앵커 클릭처럼 주소에 #id를 남겨 링크 공유·뒤로 가기가 그대로 동작하게 함
  history.pushState(history.state, "", `#${id}`);
}

// 헤딩 레벨 → 들여쓰기 클래스
const INDENT_BY_LEVEL: Record<number, string> = {
  1: "pl-0",
  2: "pl-3",
  3: "pl-6",
  4: "pl-9",
};

interface TableOfContentsProps {
  headings: Heading[];
  onNavigate?: () => void;
}

export default function TableOfContents({ headings, onNavigate }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav>
      <ul className="space-y-0.5">
        {headings.map(({ level, text, id }) => {
          const isActive = activeId === id;
          // 레벨별 들여쓰기 — 정의되지 않은 레벨은 가장 깊은 단계로 처리
          const indent = INDENT_BY_LEVEL[level] ?? "pl-9";
          const color = isActive
            ? "text-accent font-semibold"
            : "text-muted hover:text-ink";

          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  scrollToHeading(e, id);
                  onNavigate?.();
                }}
                className={`block py-1 text-[13px] leading-snug transition-colors font-sans ${indent} ${color}`}
              >
                {text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
