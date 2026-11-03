// 홈 인트로의 "들어가기 >" 링크 — 화면 우측 하단에 놓임(위치는 HomeIntro가 정함), 크기는 lg(18px). 누르면 인트로가 흐려진 뒤 글 목록(/posts)으로 넘어감
// 기본은 /posts로 가는 평범한 링크 → JS가 없어도, 새 탭(Ctrl/⌘+클릭)으로 열어도 그대로 동작
// 일반 클릭일 때만 기본 이동을 막고 IntroStage의 전환(fade out → 이동)에 맡김
// "들어가기" 글자엔 3초마다 60° 새벽빛이 0.5초 동안 지나가는 샤이닝 — "여기를 누르면 된다"는 조용한 신호
"use client";

import React from "react";
import { POST_LIST_PATH } from "@/lib/postList";
import { useIntroLeave } from "./IntroStage";

export default function IntroEnterLink(): React.JSX.Element {
  const leave = useIntroLeave();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>): void {
    // 새 탭·새 창으로 여는 클릭은 브라우저에 맡김
    if (!leave || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    leave();
  }

  return (
    <a
      href={POST_LIST_PATH}
      onClick={handleClick}
      // 글자 크기는 시스템 타입 스케일 lg(18px) — 소개 문구(xl, 22px)보다 한 단계 작게, 화면 모서리에서 조용히 "다음"을 알리는 크기
      // 색은 보조 텍스트(--muted) — 화면에서 가장 먼저 읽히는 건 헤드라인이고, 이건 그다음에 눈이 가는 자리. hover 시 accent(다음으로 넘어가는 색)
      className="group inline-flex items-center gap-[0.25em] text-lg leading-none font-semibold tracking-tight font-sans text-muted transition-colors hover:text-accent"
    >
      {/* 글자 위로 3초마다 새벽빛 사선이 지나가는 샤이닝(globals.css .shine-text) — 꺾쇠는 currentColor라 빛 없이 회색 유지 */}
      <span className="shine-text">들어가기</span>
      {/* ">" 꺾쇠 — 글자 크기를 따라가도록 em 단위, 장식이라 스크린리더에서 숨김("들어가기"가 이름 역할) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="0.8em"
        height="0.8em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </a>
  );
}
