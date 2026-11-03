// 애니메이션 공용 헬퍼 — 등장 순번(--i)을 CSS 변수로 넘기기, motion 토큰 길이 읽기
// 실제 지연 계산(순번 × --stagger-step)과 애니메이션은 globals.css가 담당

import type { CSSProperties } from "react";

// style={staggerStyle(2)} → 이 요소는 순번 2만큼 늦게 등장
export function staggerStyle(index: number): CSSProperties {
  // React의 CSSProperties 타입엔 커스텀 속성(--i)이 정의돼 있지 않아서 단언이 필요
  // (숫자를 넘겨도 React는 커스텀 속성에 px를 붙이지 않으므로 calc() 안에서 그대로 곱해짐)
  return { "--i": index } as CSSProperties;
}

// CSS 토큰 길이를 ms 숫자로 읽음 — 닫힘 트랜지션이 끝난 뒤 언마운트하는 setTimeout처럼 JS가 길이를 알아야 할 때 사용
// 값을 TS에 복사해 두면 디자인 시스템 버전을 올려 토큰이 바뀔 때 어긋나므로, tokens.css를 원본으로 두고 실행 중에 읽음
// document를 쓰므로 브라우저에서만 호출 (useEffect 안 등)
export function readMotionMs(token: "--motion-fast" | "--motion-base"): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const value = parseFloat(raw);
  // 토큰을 못 읽으면 기다리지 않고 바로 언마운트 — 애니메이션만 생략되고 동작은 깨지지 않음
  if (Number.isNaN(value)) return 0;
  return raw.endsWith("ms") ? value : value * 1000;
}
