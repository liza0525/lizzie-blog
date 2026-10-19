// 블로그 포스트 내부 타입 정의
// Notion API 응답을 mapper를 통해 이 타입으로 변환해서 사용

// essay: 호흡이 긴 글, note: 짧게 적어두는 글
export type PostType = "essay" | "note";

export interface Post {
  id: string;
  slug: string;
  title: string;
  description: string;
  publishedAt: string;    // ISO 8601 날짜 문자열
  updatedAt: string;      // Notion 페이지 마지막 수정 시각 (last_edited_time)
  tags: string[];
  coverImage: string | null;
  type: PostType;
  series: string | null;  // 소속 시리즈 이름 (Notion Series select) — 없으면 null
}

// 시리즈 — 같은 Series 값을 가진 essay 묶음
// 지금은 Notion select 속성 기반이라 이름이 곧 식별자 (추후 별도 Series DB로 옮겨도 이 타입은 유지)
export interface Series {
  name: string;
  posts: Post[];               // PublishedAt 오름차순 (1편 → 최신편)
  latestPublishedAt: string;   // 가장 최근 편의 발행일 — 시리즈 목록 정렬용
}

// 글 상세에서 쓰는 "이 글이 시리즈의 몇 번째인지" 정보
export interface SeriesPosition {
  series: Series;
  index: number;           // 0부터 시작 — 화면에는 index + 1로 표시
  prev: Post | null;       // 시리즈 안 이전 편
  next: Post | null;       // 시리즈 안 다음 편
}


// 페이지네이션 결과
export interface PostListPage {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}
