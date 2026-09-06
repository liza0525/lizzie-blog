// 블로그 전역 설정

// 최상위 카테고리 태그 — accent2(테라코타)로 표시
export const CORE_TAGS = ["백엔드", "프론트엔드", "인프라", "데이터", "AI", "디자인", "후기", "회고", "TIL"] as const;

// 빌드 시(generateStaticParams) 미리 정적 생성할 최신 포스트 수
// 전체를 다 빌드하면 포스트마다 Notion 블록 트리를 병렬로 긁어오는 구조라
// 글이 쌓일수록 빌드 한 번에 Notion rate limit(429)에 걸림 — 나머지는 dynamicParams로 첫 방문 시 생성
export const STATIC_BUILD_POST_LIMIT = 20;
