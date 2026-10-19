// 목록 화면 표시용 마커 — 렌더링은 하지 않고, 이 목록을 "마지막으로 본 목록"으로 sessionStorage에 기록
// 홈(전체 글 목록)과 시리즈 상세 페이지에 둠 → 글 상세의 BackToListLink가 이 값을 읽어 돌아갈 곳을 정함
// 태그·검색어가 바뀌면 href가 달라지므로 effect가 다시 실행되어 최신 필터 상태가 저장됨
"use client";

import { useEffect } from "react";
import { saveListOrigin } from "@/lib/listOrigin";

interface ListOriginMarkerProps {
  href: string;
  label: string;
}

export default function ListOriginMarker({ href, label }: ListOriginMarkerProps): null {
  useEffect(() => {
    saveListOrigin({ href, label });
  }, [href, label]);

  return null;
}
