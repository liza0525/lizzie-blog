// 홈 히어로(랜딩) — 처음 온 사람에게 블로그를 소개하는 캐치프레이즈 + 짧은 소개
// 문구는 lib/config.ts의 HOME_HERO에서 관리. highlight 부분에 accent 밑줄 2px (디자인 시스템의 "강조 = 밑줄" 언어)
// 등장 순서: 캐치프레이즈 어절이 하나씩 → 밑줄이 왼쪽→오른쪽으로 그어짐 → 소개 문구
//   서버에서 어절을 <span>으로 나눠 두고 CSS 애니메이션만 쓰므로 JS 없이도 재생되고, 하이드레이션 전 깜빡임이 없음
// 장식(그라데이션·아이콘 등) 없이 타이포그래피만으로 구성

import React from "react";
import type { HomeHeroCopy } from "@/types";
import { staggerStyle } from "@/lib/motion";

interface HomeHeroProps {
  copy: HomeHeroCopy;
}

interface HighlightParts {
  before: string;
  match: string;
  after: string;
}

// "이유까지"처럼 강조가 어절 일부일 수 있어서 어절 안에서 앞/강조/뒤로 나눔 — 없으면 null
function splitHighlight(word: string, highlight: string): HighlightParts | null {
  const start = highlight ? word.indexOf(highlight) : -1;
  if (start === -1) return null;
  const end = start + highlight.length;
  return { before: word.slice(0, start), match: word.slice(start, end), after: word.slice(end) };
}

function splitWords(text: string): string[] {
  return text.split(" ").filter((word) => word.length > 0);
}

export default function HomeHero({ copy }: HomeHeroProps): React.JSX.Element {
  const words = splitWords(copy.catchphrase);
  // 강조는 처음 나오는 어절 하나에만
  const highlightIndex = words.findIndex((word) => splitHighlight(word, copy.highlight) !== null);
  // 순번: 어절 N개(0 ~ N-1) → 마지막 어절이 떠오르는 도중에 밑줄(N+1) → 소개(N+2)
  const underlineStep = words.length + 1;
  const introStep = words.length + 2;

  return (
    <section className="pt-6 pb-14 sm:pt-12 sm:pb-20">
      <h1 className="text-display font-bold tracking-tight text-ink">
        {/* 스크린리더는 어절 조각이 아니라 문장 전체를 읽도록 원문을 따로 두고, 쪼갠 쪽은 숨김 */}
        <span className="sr-only">{copy.catchphrase}</span>
        <span aria-hidden="true">
          {words.map((word, i) => {
            const parts = i === highlightIndex ? splitHighlight(word, copy.highlight) : null;
            return (
              <React.Fragment key={i}>
                {i > 0 && " "}
                {/* transform은 inline 요소에 적용되지 않아서 inline-block — 줄바꿈은 어절 사이 공백에서만 일어남 */}
                <span className="inline-block animate-fade-up" style={staggerStyle(i)}>
                  {parts ? (
                    <>
                      {parts.before}
                      {/* 밑줄은 ::after로 그림. --i는 ::after에도 상속되어 밑줄 시작 시점이 됨 */}
                      <span
                        className="relative after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent after:origin-left after:animate-underline-draw"
                        style={staggerStyle(underlineStep)}
                      >
                        {parts.match}
                      </span>
                      {parts.after}
                    </>
                  ) : (
                    word
                  )}
                </span>
              </React.Fragment>
            );
          })}
        </span>
      </h1>
      <p className="mt-5 max-w-reading text-lg text-muted animate-fade-up" style={staggerStyle(introStep)}>
        {copy.intro}
      </p>
    </section>
  );
}
