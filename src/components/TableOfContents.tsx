// 포스트 우측 목차(TOC) — h1/h2/h3 계층 구조로 렌더링
// IntersectionObserver로 현재 읽고 있는 섹션을 감지해 활성 항목 하이라이팅
// rehype-slug가 생성한 헤딩 id를 앵커로 사용
"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/toc";

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
      <ul className="border-l border-gray-200 dark:border-gray-700 space-y-0.5">
        {headings.map(({ level, text, id }) => {
          const isActive = activeId === id;

          // 계층별 들여쓰기와 텍스트 스타일 (동적 클래스 대신 명시적으로)
          const indent =
            level === 1 ? "pl-3" : level === 2 ? "pl-5" : "pl-7";
          const fontSize =
            level === 1 ? "text-sm" : level === 2 ? "text-sm" : "text-xs";
          const baseColor = isActive
            ? "text-gray-900 dark:text-white font-medium"
            : level === 3
            ? "text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200";

          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`block py-1 leading-snug -ml-px border-l-2 transition-colors ${indent} ${fontSize} ${baseColor} ${
                  isActive
                    ? "border-gray-900 dark:border-white"
                    : "border-transparent"
                }`}
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
