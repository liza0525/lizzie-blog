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
}


// 페이지네이션 결과
export interface PostListPage {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}
