// 사이트 전체 UI 문자열 딕셔너리 (한국어 / 영어)
// 언어 상태는 lang 쿠키로 관리 — getLang()으로 안전하게 추출

export type Lang = "ko" | "en";

export function getLang(cookieValue: string | undefined): Lang {
  return cookieValue === "en" ? "en" : "ko";
}

export const dict = {
  ko: {
    backToList: "목록으로",
    prevPost: "이전 글",
    nextPost: "다음 글",
    loading: "불러오는 중...",
    noResults: (q: string) => `"${q}"에 대한 검색 결과가 없습니다.`,
    noTagResults: (tag: string) => `"${tag}" 태그의 글이 없습니다.`,
    noPosts: "아직 게시된 글이 없습니다.",
    langToggle: "EN",
    langToggleLabel: "영어로 전환",
    translationError: "번역을 일시적으로 사용할 수 없습니다. 원문(한국어)을 표시합니다.",
  },
  en: {
    backToList: "Back to list",
    prevPost: "Previous",
    nextPost: "Next",
    loading: "Loading...",
    noResults: (q: string) => `No results for "${q}".`,
    noTagResults: (tag: string) => `No posts tagged "${tag}".`,
    noPosts: "No posts yet.",
    langToggle: "KO",
    langToggleLabel: "한국어로 전환",
    translationError: "Translation is temporarily unavailable. Showing original Korean content.",
  },
} as const;
