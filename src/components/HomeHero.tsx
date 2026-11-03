// 글 목록(/posts) 위 히어로 — 브랜드 헤드라인 + 짧은 소개
// 문구는 lib/config.ts의 HOME_HERO에서 관리 (홈 인트로와 같은 문구)
// highlight 부분은 새벽빛(sunrise) 면 — 디자인 시스템 0.1.0의 .mark-sunrise와 같은 모양
// 등장은 투명도만 바뀌는 fade (제목 → 소개). 디자인 시스템 0.1.0에서 위치 이동·순차로 떠오르는 효과는 쓰지 않음

import React from "react";
import type { HomeHeroCopy } from "@/types";
import { staggerStyle } from "@/lib/motion";

interface HomeHeroProps {
  copy: HomeHeroCopy;
}

// 헤드라인을 강조 앞 / 강조 / 강조 뒤로 나눔 — 강조가 없으면 null
function splitHighlight(text: string, highlight: string): [string, string, string] | null {
  const start = highlight ? text.indexOf(highlight) : -1;
  if (start === -1) return null;
  const end = start + highlight.length;
  return [text.slice(0, start), text.slice(start, end), text.slice(end)];
}

export default function HomeHero({ copy }: HomeHeroProps): React.JSX.Element {
  const parts = splitHighlight(copy.catchphrase, copy.highlight);

  return (
    <section className="pt-6 pb-14 sm:pt-12 sm:pb-20">
      <h1 className="text-display font-bold tracking-tight text-ink animate-fade-in" style={staggerStyle(0)}>
        {parts ? (
          <>
            {parts[0]}
            {/* box-decoration-break: clone → 줄이 바뀌어도 줄마다 면 모서리가 온전히 그려짐 */}
            <mark className="rounded-box bg-sunrise text-on-sunrise px-[0.15em] [box-decoration-break:clone]">{parts[1]}</mark>
            {parts[2]}
          </>
        ) : (
          copy.catchphrase
        )}
      </h1>
      <p className="mt-5 max-w-reading text-lg text-muted animate-fade-in" style={staggerStyle(2)}>
        {copy.intro}
      </p>
    </section>
  );
}
