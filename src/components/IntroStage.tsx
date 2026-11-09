// 홈 인트로를 감싸는 전환 무대 — 인트로 → 글 목록(/posts) 이동과 그 전환 애니메이션을 담당
// 안쪽의 버튼(IntroEnterLink)은 useIntroLeave()로 전환 시작 함수를 받아 호출함
//   React Context: 부모가 값을 내려 두면, 중간 컴포넌트를 거치지 않고 아래 어디서든 꺼내 쓰는 방식
//   (인트로 본문 HomeIntro는 서버 컴포넌트라 함수를 props로 넘길 수 없어서 Context를 씀)
// 전환은 두 가지 (의도된 예외, 사용자 결정 2026-11-04):
//   - View Transition(브라우저 기본 기능): 브라우저가 인트로 화면을 찍어 두고, 목록이 다 그려지면 두 화면을 애니메이션으로 이어 줌
//     → 배경·소개·크레딧은 히어로 자리로, 헤드라인은 헤더 로고 자리로 줄어들며 옮겨 가고, 나머지 목록은 아래에서 올라오며 나타남 (모양은 globals.css)
//     → 목록을 서버에서 받는 동안엔 인트로가 그대로 보여서, 흐려진 뒤 빈 화면으로 기다리는 공백이 없음
//     → 배경은 두 그림을 같은 배율로 겹쳐 둔 채 상자만 줄어듦(setSceneScale). 가로 화면은 위아래가 잘려 나가고, 세로 화면은 그림이 실제로 작아짐
//   - 지원하지 않는 브라우저: 인트로가 흐려진 뒤(fade out) 이동. 끝나는 시점은 transitionend로 받아 길이를 JS에 복사하지 않음
//   - 동작 줄이기(reduced motion) 설정이면 애니메이션 없이 바로 이동
// 버튼 말고도 휠을 아래로 굴리기 / 화면을 위로 밀기(스와이프) / ↓·PageDown·Space 키로 같은 전환을 시작함
//   인트로는 스크롤되는 페이지가 아니라 "넘기는" 한 장이라서, 아래로 가려는 동작을 전부 "목록으로 넘기기"로 해석
//   그래서 모바일에서 화면이 손가락을 따라 끌려가지 않게 브라우저 스크롤·끝 튕김을 끔 (touch-action·overscroll-behavior)
"use client";

import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { POST_LIST_PATH } from "@/lib/postList";
import { disableHomeIntro } from "./HomeIntroMarker";
import { firstLightScale } from "./FirstLightBackground";

// transitionend가 어떤 이유로 오지 않아도(탭 전환 등) 전환이 멈춰 있지 않게 하는 안전장치
const LEAVE_FALLBACK_MS = 1000;
// View Transition은 목록이 그려질 때까지 화면을 멈춰 두므로, 목록이 늦으면(Notion 응답 지연 등) 이만큼만 기다리고 멈춤을 풂
//   → 그 뒤엔 애니메이션 없이 목록이 준비되는 대로 바뀜. 3초는 손을 떼고 멈춰 있는 시간이 너무 길어 1.5초로 줄임(2026-11-09)
const ARRIVAL_FALLBACK_MS = 1500;
// 배경 상자에 붙는 전환 이름표 (HomeIntro·HomeHero, globals.css)
const SCENE_SELECTOR = ".vt-intro-scene";
const SCENE_SCALE_VAR = "--intro-scene-scale";

// 인트로 배경 → 히어로 배경의 그림 배율 비율을 <html>에 넘김 (globals.css의 intro-scene-out/in이 사용)
// 전환 사진은 상자 크기대로 찍혀서 그대로 겹치면 배율이 달라 디졸브처럼 보임 → 이 비율로 두 사진을 같은 배율에 맞춤
//   가로 화면: 두 상자 모두 폭에 맞춰 그려져 비율 1 → 그림은 그대로, 위아래만 잘려 나감
//   세로 화면: 히어로가 더 넓은 범위를 작은 배율로 보여 줘서 비율 < 1 → 그림이 실제로 줄어듦
function setSceneScale(from: DOMRect | undefined): void {
  const to = document.querySelector(SCENE_SELECTOR)?.getBoundingClientRect();
  // 목록이 늦어(ARRIVAL_FALLBACK_MS) 아직 인트로가 남아 있으면 같은 상자를 재게 되어 비율 1 — 그대로 둬도 깨지지 않음
  if (!from || !to || from.width === 0 || to.width === 0) return;
  const ratio = firstLightScale(to.width, to.height) / firstLightScale(from.width, from.height);
  document.documentElement.style.setProperty(SCENE_SCALE_VAR, String(ratio));
}

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
  // View Transition에 "새 화면(목록)이 그려졌다"를 알리는 함수 — 이동 중일 때만 들어 있음
  const arrivedRef = useRef<(() => void) | null>(null);

  // 인트로가 화면에서 빠지는 순간 = 목록이 DOM에 들어온 순간 (App Router는 목록이 준비될 때까지 인트로를 그대로 두고 한 번에 바꿈)
  // useLayoutEffect의 정리 함수는 DOM을 바꾸는 바로 그 단계에서 실행돼서, 여기서 알리면 브라우저가 목록이 들어간 화면을 찍음
  useLayoutEffect(() => {
    return () => {
      // 이동 중에 채워지는 값이라 정리 시점의 최신 .current를 읽음
      arrivedRef.current?.();
    };
  }, []);

  // 글 목록을 미리 받아 둠 → 넘긴 뒤 목록이 뜨기까지 기다리는 시간을 줄임
  useEffect(() => {
    router.prefetch(POST_LIST_PATH);
  }, [router]);

  // View Transition으로 이동 — 인트로를 찍어 둔 채 목록을 그리고, 다 그려지면 두 화면을 이어 붙임
  const leaveWithViewTransition = useCallback((): void => {
    const root = document.documentElement;
    // 목록의 순차 등장(data-intro)은 끔 — 켜 두면 전환 애니메이션 위에 등장 fade가 한 번 더 겹침
    disableHomeIntro();
    // 이 표시가 있는 동안만 배경·헤드라인·소개·크레딧에 전환 이름(view-transition-name)이 붙음 (globals.css)
    root.dataset.introTransition = "";
    // 인트로 배경 상자 크기 — 목록으로 바뀌면 사라지므로 미리 재 둠
    const fromScene = document.querySelector(SCENE_SELECTOR)?.getBoundingClientRect();

    // 넘긴 함수가 끝나면(Promise가 풀리면) 브라우저가 새 화면을 찍고 애니메이션을 시작함
    const transition = document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          arrivedRef.current = resolve;
          setTimeout(resolve, ARRIVAL_FALLBACK_MS);
          router.push(POST_LIST_PATH);
        })
          // then: 인트로가 빠지는 순간(useLayoutEffect 정리)엔 히어로가 아직 DOM에 안 붙었을 수 있어서,
          //   React가 화면 교체를 다 끝낸 뒤(다음 마이크로태스크)에 히어로 배경을 잼
          .then(() => setSceneScale(fromScene)),
    );
    // ready는 전환이 건너뛰어지면(시간 초과 등) reject됨 — 목록은 그대로 뜨므로 콘솔 오류만 막음
    transition.ready.catch(() => {});
    const cleanUp = (): void => {
      delete root.dataset.introTransition;
      root.style.removeProperty(SCENE_SCALE_VAR);
    };
    transition.finished.then(cleanUp, cleanUp);
  }, [router]);

  // View Transition을 지원하지 않는 브라우저 — 무대가 흐려진 뒤 이동
  const leaveWithFade = useCallback((stage: HTMLDivElement): void => {
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

  const leave = useCallback((): void => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    const stage = stageRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!stage || reduceMotion) {
      router.push(POST_LIST_PATH);
    } else if (typeof document.startViewTransition === "function") {
      leaveWithViewTransition();
    } else {
      leaveWithFade(stage);
    }
  }, [router, leaveWithViewTransition, leaveWithFade]);

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
      {/* View Transition 미지원 브라우저의 흐려짐. 사라짐 규칙(디자인 시스템 0.1.0): --motion-fast(150ms) + ease-motion-exit — 천천히 떠나기 시작해서 빠르게 끝남
          touch-pinch-zoom(touch-action: pinch-zoom): 손가락으로 화면을 끌어 스크롤하는 건 막고 두 손가락 확대만 허용
            → 스와이프해도 화면이 끌려 올라갔다 튕겨 내려오지 않고 전환만 보임. touchmove 이벤트는 그대로 와서 스와이프 감지는 동작함
          data-intro-stage: 인트로에 있는 동안 <html>의 끝 튕김을 끄는 표시 (globals.css) */}
      <div
        ref={stageRef}
        data-intro-stage
        className={`touch-pinch-zoom transition-opacity duration-(--motion-fast) ease-motion-exit ${leaving ? "opacity-0" : "opacity-100"}`}
      >
        {children}
      </div>
    </IntroLeaveContext.Provider>
  );
}
