// 글 상세 상단 돌아가기 링크 — 처음 들어온 목록(전체 글 목록 / 시리즈 목록)으로 이동
// 목적지와 문구는 ListOriginMarker가 sessionStorage에 남긴 값으로 결정, 기록이 없으면 "글 목록"(/)
// 주의: 서버 렌더링 시점엔 sessionStorage를 읽을 수 없어 기본값으로 그린 뒤, 브라우저에서 저장값으로 바뀜
"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { parseListOrigin, readListOriginRaw } from "@/lib/listOrigin";

// sessionStorage는 같은 탭 안에서 바뀌어도 알려주는 이벤트가 없음
// 글 상세에 머무는 동안 값이 바뀌지 않으므로(목록 화면에서만 기록) 구독은 하지 않음
function subscribe(): () => void {
  return () => {};
}

export default function BackToListLink(): React.JSX.Element {
  // useSyncExternalStore: 브라우저 저장소 같은 React 바깥 값을 읽는 훅
  // 세 번째 인자(getServerSnapshot)가 서버 렌더링·hydration 때 쓰일 값 → null이면 기본값 "글 목록"
  const raw = useSyncExternalStore(subscribe, readListOriginRaw, () => null);
  const origin = parseListOrigin(raw);

  return (
    <Link
      href={origin.href}
      className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-10 font-sans"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {origin.label}
    </Link>
  );
}
