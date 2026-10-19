// "글을 어느 목록에서 열었는지" 기억하는 클라이언트 전용 유틸 (sessionStorage)
// 글 상세의 돌아가기 버튼이 처음 들어온 목록(전체 글 목록 / 시리즈 목록)으로 돌아가게 하기 위함
// - 목록 화면이 열릴 때 ListOriginMarker가 저장하고, 글 상세(BackToListLink)는 읽기만 함
// - 이전/다음 글로 이어서 읽어도 글 상세는 값을 덮어쓰지 않으므로 처음 진입한 목록이 유지됨
// - URL 쿼리(?from=)로 넘기지 않는 이유: 글 상세는 SSG라 searchParams를 읽으면 매 요청 동적 렌더링으로 바뀜

export interface ListOrigin {
  href: string;   // 돌아갈 경로 (필터·검색어 포함, 예: "/?tag=백엔드", "/series/CS")
  label: string;  // 버튼 문구 (예: "글 목록", "CS 시리즈")
}

const STORAGE_KEY = "blog:list-origin";

// 외부 링크·새 탭으로 바로 들어와 기록이 없을 때의 기본값
export const DEFAULT_LIST_ORIGIN: ListOrigin = { href: "/", label: "글 목록" };

export function saveListOrigin(origin: ListOrigin): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(origin));
  } catch {
    // 사생활 보호 모드 등에서 저장이 막혀도 기본값으로 동작하면 되므로 무시
  }
}

// 원본 문자열을 그대로 반환 — useSyncExternalStore의 스냅샷은 매번 같은 값(문자열)이어야 무한 렌더링이 안 남
export function readListOriginRaw(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

// 저장된 문자열 → ListOrigin (형식이 깨졌거나 외부 경로면 기본값)
export function parseListOrigin(raw: string | null): ListOrigin {
  if (!raw) return DEFAULT_LIST_ORIGIN;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" && value !== null &&
      "href" in value && "label" in value &&
      typeof value.href === "string" && typeof value.label === "string" &&
      value.href.startsWith("/")  // 사이트 내부 경로만 허용
    ) {
      return { href: value.href, label: value.label };
    }
  } catch {
    // JSON 파싱 실패 → 기본값
  }
  return DEFAULT_LIST_ORIGIN;
}
