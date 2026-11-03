// 홈 인트로의 "들어가기" 버튼 — 누르면 인트로가 흐려진 뒤 글 목록(/posts)으로 넘어감
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
      // 색 면 버튼(primary) 대신 accent 밑줄 2px 텍스트 — 제목 키워드 밑줄과 같은 "강조 = 밑줄" 언어라 화면이 차분하게 이어짐
      className="inline-block border-b-2 border-accent pb-0.5 text-base font-semibold font-sans text-ink transition-colors hover:text-accent"
    >
      들어가기
    </a>
  );
}
