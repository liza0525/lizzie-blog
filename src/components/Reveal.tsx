// 스크롤 등장 래퍼 — 화면 아래에 있던 요소가 스크롤로 들어올 때 아래에서 떠오르며 나타남
// 마운트 시점에 이미 화면 안에 있는 요소는 건드리지 않음 (서버에서 그려 보여 준 걸 다시 숨기면 깜빡이므로)
//   → JS가 없거나 늦게 로드돼도 내용이 안 보이는 일은 없음
// 숨김/전환 스타일은 globals.css의 [data-reveal]이 담당하고, 여기서는 data-reveal 값만 바꿈
"use client";

import React, { useLayoutEffect, useRef } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
}

// 한꺼번에 화면에 들어온 요소끼리 순차 등장할 때 최대 몇 칸까지 늦출지 — 빠르게 많이 스크롤해도 끝이 처지지 않게
const MAX_STAGGER = 4;

// 모든 Reveal이 IntersectionObserver 하나를 공유 — 같은 콜백에 함께 들어온 요소들이 한 묶음이라 순번을 매기기 쉬움
let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (sharedObserver) return sharedObserver;

  const observer = new IntersectionObserver(
    (entries) => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue;
        entry.target.style.setProperty("--i", String(Math.min(order, MAX_STAGGER)));
        entry.target.dataset.reveal = "shown";
        // 한 번 나타난 뒤에는 다시 숨기지 않으므로 관찰 종료
        observer.unobserve(entry.target);
        order += 1;
      }
    },
    // 화면 맨 아래 끝에 걸치자마자가 아니라 조금 올라왔을 때 등장해야 움직임이 눈에 들어옴
    { rootMargin: "0px 0px -10% 0px" }
  );
  sharedObserver = observer;
  return observer;
}

export default function Reveal({ children, className }: RevealProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  // useLayoutEffect: 브라우저가 화면을 그리기 직전에 실행 → 화면 아래 요소를 숨기는 순간이 사용자 눈에 보이지 않음
  // data-reveal은 React가 렌더링하는 속성이 아니라 DOM에 직접 붙이는 것이라, 리렌더링돼도 지워지지 않음
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    element.dataset.reveal = "pending";
    const observer = getObserver();
    observer.observe(element);
    // 등장 전에 언마운트되면(태그 변경 등) 관찰만 정리
    return () => observer.unobserve(element);
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
