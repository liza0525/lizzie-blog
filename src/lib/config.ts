// 블로그 전역 설정

import type { HomeHeroCopy } from "@/types";

// 홈 히어로(랜딩) 문구 — 디자인 시스템 0.1.0 브랜드 철학 기준
// intro는 쉼표로 열어 둔 헤드라인을 받아 완성하는 말 → "질문으로 접점을 찾는, 일단 해 보는 사람의 이야기"
//   "이야기"는 기술 글과 나중에 올릴 소개 글을 둘 다 품는 말이라 골랐음 (직함·"정리한다"는 쓰지 않음)
// highlight는 catchphrase 안에 그대로 들어 있는 부분이어야 새벽빛 강조가 붙음 (없으면 강조 없이 표시)
export const HOME_HERO: HomeHeroCopy = {
  catchphrase: "질문으로 접점을 찾는,",
  highlight: "질문",
  intro: "일단 해 보는 사람의 이야기",
};

// 최상위 카테고리 태그 — accent-soft 면 태그로 표시 (그 외 태그는 선만 있는 태그)
// 자주 바꾸는 값이라 코드 대신 env(쉼표 구분)로 관리. 적힌 순서가 홈 태그 바 순서가 된다
// 클라이언트 컴포넌트(TagFilter, PostGrid)에서도 쓰므로 NEXT_PUBLIC_ — 빌드 시 값이 박히니 바꾸면 재배포 필요
// 비어 있으면 코어 태그 없이 모든 태그를 일반 태그로 표시
export const CORE_TAGS: readonly string[] = parseTagList(process.env.NEXT_PUBLIC_CORE_TAGS);

// "백엔드, 인프라,,AI" → ["백엔드", "인프라", "AI"] (앞뒤 공백·빈 항목 제거)
function parseTagList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

// 빌드 시(generateStaticParams) 미리 정적 생성할 최신 포스트 수
// 전체를 다 빌드하면 포스트마다 Notion 블록 트리를 병렬로 긁어오는 구조라
// 글이 쌓일수록 빌드 한 번에 Notion rate limit(429)에 걸림 — 나머지는 dynamicParams로 첫 방문 시 생성
export const STATIC_BUILD_POST_LIMIT = 20;
