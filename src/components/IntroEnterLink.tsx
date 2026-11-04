// 홈 인트로의 "Scroll down" 링크 — 화면 가운데 아래에 "Scroll down" + ↓ 를 한 묶음으로 두고, 통통 튀는 바운스로 "여기서 넘어간다"를 알림
// 문구대로 휠을 내리거나 위로 스와이프해도 넘어감(IntroStage) — 누르는 것도 같은 전환
// 누르면 인트로가 흐려진 뒤 글 목록(/posts)으로 넘어감 (위치는 HomeIntro가 정함, 바운스는 globals.css의 .intro-bounce)
// 기본은 /posts로 가는 평범한 링크 → JS가 없어도, 새 탭(Ctrl/⌘+클릭)으로 열어도 그대로 동작
// 일반 클릭일 때만 기본 이동을 막고 IntroStage의 전환(fade out → 이동)에 맡김
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
      // 글자 크기는 시스템 타입 스케일 lg(18px), 색은 보조 텍스트(--muted) — 헤드라인 다음에 눈이 가는 자리. hover 시 accent
      // 문구와 ↓ 가 같은 링크라 둘 중 어디를 눌러도 넘어가고, 바운스도 함께 튐
      className="intro-bounce flex flex-col items-center gap-1 text-lg leading-none font-semibold tracking-tight font-sans text-muted transition-colors hover:text-accent"
    >
      Scroll down
      {/* ↓ 꺾쇠 — 장식이라 스크린리더에서 숨김("Scroll down"이 링크 이름 역할) */}
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
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </a>
  );
}
