// 블로그 포스트 내부 타입 정의
// Notion API 응답을 mapper를 통해 이 타입으로 변환해서 사용

export interface Post {
  id: string;
  slug: string;
  title: string;
  description: string;
  publishedAt: string;    // ISO 8601 날짜 문자열
  tags: string[];
  coverImage: string | null;
}

// 목록용 (상세 내용 제외)
export type PostSummary = Omit<Post, never>;

// 상세 페이지용 (마크다운 본문 포함)
export interface PostDetail extends Post {
  content: string;        // notion-to-md로 변환된 마크다운
}

// 페이지네이션 결과
export interface PostListPage {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}
