// 글 목록(/posts) 주소 만들기 — 태그·검색어를 쿼리로 붙임
// 태그·검색·돌아가기·헤더 홈 아이콘처럼 "목록을 보여 주는 이동"은 전부 이 함수를 씀 (주소 규칙을 한 곳에서 관리)
// 홈(/)은 헤더 없는 인트로 전용이고, 인트로로 가는 링크는 헤더의 블로그 제목 하나뿐

export const POST_LIST_PATH = "/posts";

interface PostListParams {
  tag?: string;
  q?: string;
}

// { tag: "Backend" } → "/posts?tag=Backend", 인자 없음 → "/posts"
export function postListHref({ tag, q }: PostListParams = {}): string {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `${POST_LIST_PATH}?${query}` : POST_LIST_PATH;
}
