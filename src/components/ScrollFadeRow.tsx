// 가로 스크롤 줄 + 오른쪽 끝 페이드 — "옆에 더 있다"는 힌트
// 내용이 넘칠 때만, 그리고 끝까지 스크롤하기 전까지만 페이드를 보여줌 (넘치지 않으면 장식이 생기지 않음)
// 페이드는 --bg로 녹아드는 그라데이션이라 다크/라이트 모두 토큰만으로 대응
"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollFadeRowProps {
  children: React.ReactNode;
  className?: string;  // 스크롤 컨테이너(flex 줄)에 붙일 클래스 — gap, 여백 등
}

export default function ScrollFadeRow({ children, className = "" }: ScrollFadeRowProps): React.JSX.Element {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    // 오른쪽에 아직 가려진 내용이 1px이라도 남아 있으면 페이드 표시
    function update(): void {
      if (!row) return;
      setShowFade(row.scrollLeft + row.clientWidth < row.scrollWidth - 1);
    }

    // ResizeObserver는 observe 직후 한 번 호출되므로 초기 상태 계산도 여기서 처리됨
    const observer = new ResizeObserver(update);
    observer.observe(row);
    row.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      row.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <div className="relative">
      <div ref={rowRef} className={`flex overflow-x-auto ${className}`}>
        {children}
      </div>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-bg transition-opacity duration-200 ${
          showFade ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
