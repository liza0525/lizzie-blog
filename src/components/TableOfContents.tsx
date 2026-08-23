// 포스트 우측 목차(TOC) — h1/h2/h3/h4 계층 구조로 렌더링
// IntersectionObserver로 현재 읽고 있는 섹션을 감지해 활성 항목 하이라이팅
// rehype-slug가 생성한 헤딩 id를 앵커로 사용
"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/toc";

// 헤딩 레벨 → 들여쓰기 클래스
const INDENT_BY_LEVEL: Record<number, string> = {
  1: "pl-0",
  2: "pl-3",
  3: "pl-6",
  4: "pl-9",
};

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
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
