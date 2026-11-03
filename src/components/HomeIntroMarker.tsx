// 홈 등장 애니메이션 끄기 마커 — 렌더링은 하지 않고, 홈 안에서 이동하거나 홈을 떠나면 이후 애니메이션을 끔
// 끄는 방법: <html data-intro-seen>을 붙이면 globals.css 규칙이 [data-intro] 안의 애니메이션을 전부 끔
// → 뒤로 가기·태그 클릭·"전체"로 돌아올 땐 재생 안 됨. 새로고침하면 <html>이 새로 만들어져 다시 재생
//   (첫 진입 중에 바로 붙이면 재생 중인 애니메이션이 끊기므로 "떠날 때" 붙임)
"use client";

import { useEffect, useRef } from "react";

interface HomeIntroMarkerProps {
  listHref: string;  // 현재 태그·검색 상태가 담긴 홈 URL — 바뀌면 사용자가 홈 안에서 이동한 것
}

function disableHomeIntro(): void {
  document.documentElement.dataset.introSeen = "";
}

// 언마운트 시 끄기를 바로 하지 않고 한 틱 미뤄 두는 타이머
// 개발 모드(React StrictMode)는 effect를 "실행 → 정리 → 다시 실행"으로 한 번 더 돌려 보는데,
// 그 가짜 정리에서 바로 끄면 첫 진입 애니메이션이 개발 서버에서 항상 끊김 → 다시 실행되면 취소
let pendingDisable: ReturnType<typeof setTimeout> | null = null;

export default function HomeIntroMarker({ listHref }: HomeIntroMarkerProps): null {
  const initialHref = useRef(listHref);

  useEffect(() => {
    if (pendingDisable) {
      clearTimeout(pendingDisable);
      pendingDisable = null;
    }
    return () => {
      pendingDisable = setTimeout(disableHomeIntro, 0);
    };
  }, []);

  useEffect(() => {
    // 첫 진입 URL과 같으면 아직 이동 전 (StrictMode의 두 번째 실행도 여기서 걸러짐)
    if (listHref !== initialHref.current) disableHomeIntro();
  }, [listHref]);

  return null;
}
