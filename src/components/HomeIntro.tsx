// 홈 전체 화면 인트로(랜딩) — 헤더 없이 화면 전체에 캐치프레이즈 + 짧은 소개 + "들어가기" 버튼
// 버튼(또는 휠·스와이프·키보드)으로 넘기면 인트로가 흐려진 뒤 글 목록(/posts)으로 넘어감 (전환은 감싸는 IntroStage가 담당)
// 문구는 lib/config.ts의 HOME_HERO에서 관리. highlight 부분에 accent 밑줄 2px (디자인 시스템의 "강조 = 밑줄" 언어)
// 등장 순서: 캐치프레이즈가 한 글자씩 타이핑 → 밑줄이 왼쪽→오른쪽으로 그어짐 → 소개 → 버튼·아래 화살표
//   전부 CSS 애니메이션 + 같은 순번 단위(--i × --stagger-step)라 JS 없이도 재생되고, 하이드레이션 전 깜빡임이 없음

import React from "react";
import type { HomeHeroCopy } from "@/types";
import { staggerStyle } from "@/lib/motion";
import IntroEnterLink from "./IntroEnterLink";
import TypingText, { typingEndStep } from "./TypingText";

interface HomeIntroProps {
  copy: HomeHeroCopy;
}

export default function HomeIntro({ copy }: HomeIntroProps): React.JSX.Element {
  // 순번: 글자 N개(0 ~ N-1) → 밑줄(N+1, TypingText 안) → 소개(N+3) → 버튼·화살표(N+4)
  //   밑줄이 다 그어질 즈음 소개가 나오도록 한 칸씩 띄움
  const typedStep = typingEndStep(copy.catchphrase);
  const introStep = typedStep + 3;
  const actionStep = typedStep + 4;

  return (
    // 높이 = 화면 높이 전체 (이 페이지엔 헤더가 없음)
    // svh(작은 뷰포트 높이): 모바일 주소창이 접혔다 펴질 때마다 높이가 바뀌어 화면이 튀는 것을 막음
    <section className="relative flex min-h-svh items-center">
      <div className="max-w-[900px] w-full mx-auto px-6 py-16">
        <h1 className="text-display font-bold tracking-tight text-ink">
          <TypingText text={copy.catchphrase} highlight={copy.highlight} />
        </h1>
        <p className="mt-5 max-w-reading text-lg text-muted animate-fade-up" style={staggerStyle(introStep)}>
          {copy.intro}
        </p>
        <div className="mt-10 animate-fade-up" style={staggerStyle(actionStep)}>
          <IntroEnterLink />
        </div>
      </div>

      {/* "아래로 넘기면 된다"는 힌트 — 장식이라 스크린리더에서 숨김 (같은 기능은 위 버튼이 맡음)
          바깥은 등장(fade-up), 안쪽은 반복해서 살짝 내려갔다 오는 움직임 — 한 요소에 두 animation을 겹치지 않으려고 나눔 */}
      <div
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-fade-up"
        style={staggerStyle(actionStep)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-subtle animate-nudge-down"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
