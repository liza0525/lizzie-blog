import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 글 목록이 / → /posts로 옮겨짐. 예전 주소(공유된 링크, 저장된 돌아가기 주소)의 태그·검색 쿼리를 새 목록으로 보냄
  // 쿼리(?tag=…, ?q=…)는 Next가 목적지에 그대로 붙여 줌
  // 홈 페이지 코드에서 searchParams를 읽어 리다이렉트하면 정적인 인트로가 매 요청 렌더링으로 바뀌어서 설정 파일에서 처리
  async redirects() {
    const legacyListRedirects = ["tag", "q"].map((key) => ({
      source: "/",
      has: [{ type: "query" as const, key }],
      destination: "/posts",
      permanent: true,
    }));
    // "시리즈"가 "트레일"로 이름이 바뀜 — 예전 주소(공유된 링크, sitemap, 저장된 돌아가기 주소)를 새 주소로 보냄
    const legacySeriesRedirects = [
      { source: "/series", destination: "/trails", permanent: true },
      { source: "/series/:name", destination: "/trails/:name", permanent: true },
    ];
    return [...legacyListRedirects, ...legacySeriesRedirects];
  },
};

export default nextConfig;
