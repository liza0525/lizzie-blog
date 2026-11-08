// 블로그 포스트 내부 타입 정의
// Notion API 응답을 mapper를 통해 이 타입으로 변환해서 사용

export interface Post {
  id: string;
  slug: string;
  title: string;
  description: string;
  publishedAt: string;    // ISO 8601 날짜 문자열
  updatedAt: string;      // Notion 페이지 마지막 수정 시각 (last_edited_time)
  tags: string[];
  coverImage: string | null;
  trail: string | null;  // 소속 트레일 이름 (Notion Series select) — 없으면 null
}

// 홈 히어로(랜딩) 문구 — lib/config.ts의 HOME_HERO에서 관리
export interface HomeHeroCopy {
  catchphrase: string;      // 큰 제목 한 줄 — 브랜드 이름, 인트로에만 표시 (글 목록에선 헤더 로고가 대신함)
  intro: string;            // 제목 아래 짧은 소개 1~2문장
  introHighlight: string;   // intro 안에서 새벽빛(sunrise) 형광펜을 그을 부분 (intro에 그대로 들어 있어야 함)
  credit: string;           // 소개 아래 만든 사람 한 줄
  role: string;             // 크레딧 다음 줄 직함 — 첫 화면에서 무슨 일을 하는 사람인지 바로 보이게. 인트로에만 표시
}

// 트레일 — 같은 Notion Series 값을 가진 글 묶음
// 지금은 Notion select 속성 기반이라 이름이 곧 식별자 (추후 별도 Trail DB로 옮겨도 이 타입은 유지)
export interface Trail {
  name: string;
  posts: Post[];               // PublishedAt 오름차순 (1편 → 최신편)
  latestPublishedAt: string;   // 가장 최근 편의 발행일 — 트레일 목록 정렬용
}

// 글 상세에서 쓰는 "이 글이 트레일의 몇 번째인지" 정보
export interface TrailPosition {
  trail: Trail;
  index: number;           // 0부터 시작 — 화면에는 index + 1로 표시
  prev: Post | null;       // 트레일 안 이전 편
  next: Post | null;       // 트레일 안 다음 편
}


// 페이지네이션 결과
export interface PostListPage {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}
