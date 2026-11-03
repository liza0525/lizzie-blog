// 홈 인트로를 감싸는 전환 무대 — "인트로가 흐려진 뒤(fade out) 글 목록(/posts)으로 이동"을 담당
// 안쪽의 버튼(IntroEnterLink)은 useIntroLeave()로 전환 시작 함수를 받아 호출함
//   React Context: 부모가 값을 내려 두면, 중간 컴포넌트를 거치지 않고 아래 어디서든 꺼내 쓰는 방식
//   (인트로 본문 HomeIntro는 서버 컴포넌트라 함수를 props로 넘길 수 없어서 Context를 씀)
// 흐려짐이 끝나는 시점은 transitionend 이벤트로 받음 → 길이를 JS에 복사하지 않고 CSS 토큰만 원본으로 둠
// 버튼 말고도 휠을 아래로 굴리기 / 화면을 위로 밀기(스와이프) / ↓·PageDown·Space 키로 같은 전환을 시작함
//   인트로는 스크롤되는 페이지가 아니라 "넘기는" 한 장이라서, 아래로 가려는 동작을 전부 "목록으로 넘기기"로 해석
"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { POST_LIST_PATH } from "@/lib/postList";

// transitionend가 어떤 이유로 오지 않아도(탭 전환 등) 전환이 멈춰 있지 않게 하는 안전장치
const LEAVE_FALLBACK_MS = 1000;

// 휠: 트랙패드는 아주 작은 값이 연달아 들어오므로, 짧은 시간 안에 쌓인 양이 이만큼 넘으면 넘김 (살짝 건드린 건 무시)
const WHEEL_THRESHOLD = 40;
const WHEEL_RESET_MS = 200;
// 스와이프: 손가락을 위로 이만큼(px) 밀면 넘김
const SWIPE_THRESHOLD = 50;
// 키보드: 보통 "아래로 스크롤"에 쓰는 키 (" "는 Space)
const LEAVE_KEYS: ReadonlySet<string> = new Set(["ArrowDown", "PageDown", " "]);

const IntroLeaveContext = createContext<(() => void) | null>(null);

// 인트로 안의 컴포넌트가 전환을 시작할 때 사용 — IntroStage 밖이면 null
export function useIntroLeave(): (() => void) | null {
  return useContext(IntroLeaveContext);
}

interface IntroStageProps {
  children: React.ReactNode;
}

export default function IntroStage({ children }: IntroStageProps): React.JSX.Element {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);
  // 버튼 연타·휠 이벤트 연속 발생 시 한 번만 이동하도록 — state는 다음 렌더 전까지 갱신이 안 보여서 ref로 즉시 막음
  const leavingRef = useRef(false);

  // 글 목록을 미리 받아 둠 → 흐려진 뒤 목록이 뜨기까지 기다리는 시간을 줄임
  useEffect(() => {
    router.prefetch(POST_LIST_PATH);
  }, [router]);

  const leave = useCallback((): void => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    const stage = stageRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!stage || reduceMotion) {
      router.push(POST_LIST_PATH);
      return;
    }

    let done = false;
    function go(): void {
      if (done) return;
      done = true;
      router.push(POST_LIST_PATH);
    }
    // 자식 요소의 transition이 끝나도 이벤트가 올라오므로(버블링) 무대 자신의 opacity 전환만 확인
    stage.addEventListener("transitionend", (event) => {
      if (event.target === stage && event.propertyName === "opacity") go();
    });
    setTimeout(go, LEAVE_FALLBACK_MS);
    setLeaving(true);
  }, [router]);

  // 휠·스와이프·키보드 → leave(). 여러 번 들어와도 leave 안의 leavingRef가 한 번만 이동시킴
  useEffect(() => {
    let wheelSum = 0;
    let wheelResetTimer: ReturnType<typeof setTimeout> | null = null;
    let touchStartY: number | null = null;

    const handleWheel = (event: WheelEvent): void => {
      if (event.deltaY <= 0) return;  // 위로 굴린 건 무시
      wheelSum += event.deltaY;
      if (wheelResetTimer) clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => {
        wheelSum = 0;
      }, WHEEL_RESET_MS);
      if (wheelSum >= WHEEL_THRESHOLD) leave();
    };

    const handleTouchStart = (event: TouchEvent): void => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent): void => {
      const currentY = event.touches[0]?.clientY;
      if (touchStartY === null || currentY === undefined) return;
      if (touchStartY - currentY >= SWIPE_THRESHOLD) {
        touchStartY = null;
        leave();
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.altKey || event.ctrlKey || event.metaKey || !LEAVE_KEYS.has(event.key)) return;
      event.preventDefault();  // Space·PageDown의 기본 스크롤 대신 넘김
      leave();
    };

    // passive: 기본 스크롤을 막지 않겠다는 약속 → 브라우저가 스크롤을 기다리지 않고 바로 처리 (휠·터치는 막을 필요가 없음)
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      if (wheelResetTimer) clearTimeout(wheelResetTimer);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [leave]);

  return (
    <IntroLeaveContext.Provider value={leave}>
      {/* 사라짐 규칙(디자인 시스템 0.1.0): --motion-fast(150ms) + ease-motion-exit — 천천히 떠나기 시작해서 빠르게 끝남 */}
      <div
        ref={stageRef}
        className={`transition-opacity duration-(--motion-fast) ease-motion-exit ${leaving ? "opacity-0" : "opacity-100"}`}
      >
        {children}
      </div>
    </IntroLeaveContext.Provider>
  );
}
