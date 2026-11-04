// 블로그 전역 설정

import type { HomeHeroCopy } from "@/types";

// 사이트 이름 — 헤더 로고, 인트로 제목, 탭 제목(글 상세는 "글 제목 | HAE MU")이 같이 씀 (2026-11-04, 사용자 결정)
export const SITE_NAME = "HAE MU";

// 홈 인트로·글 목록 히어로 문구 (2026-11-04 교체, 사용자 결정)
// "HAE MU"(해무, 바다 안개) — 배경 일러스트 First Light의 해무와 같은 이름. 로고 같은 이름이라 글자 자체를 대문자로 씀
//   (디자인 시스템이 금지하는 건 CSS uppercase·넓은 자간으로 문장을 꾸미는 것 — 크레딧은 일반 표기)
// catchphrase(큰 제목)는 인트로에만 — 글 목록에선 헤더 로고가 같은 이름이라 히어로는 소개 + 크레딧만 보여 줌
// introHighlight는 intro 안에 그대로 들어 있는 부분이어야 새벽빛 형광펜이 붙음 (없으면 강조 없이 표시)
export const HOME_HERO: HomeHeroCopy = {
  catchphrase: SITE_NAME,
  intro: "Born from the Meeting of Worlds.",
  introHighlight: "Meeting of Worlds",
  credit: "Created and curated by Lizzie Chung, Curious Maker",
};

// 기본 탭 제목·링크 미리보기 제목, 메타 설명(소개 + 크레딧 — 제목과 같은 말이 미리보기에 두 번 나오지 않게)
export const SITE_TITLE = `${SITE_NAME}: Lizzie Chung, Curious Maker`;
export const SITE_DESCRIPTION = `${HOME_HERO.intro} ${HOME_HERO.credit}`;

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
