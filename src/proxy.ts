// 브라우저 언어 자동 감지 — Next.js 16의 proxy 파일 (구 middleware.ts)
// lang 쿠키가 없는 최초 방문자에게 Accept-Language 헤더 기반으로 언어를 설정
// 이후 방문에서는 쿠키를 그대로 유지 (사용자가 수동으로 바꾼 경우 덮어쓰지 않음)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  // 이미 lang 쿠키가 있으면 아무것도 하지 않음
  if (request.cookies.get("lang")) return response;

  // Accept-Language 헤더 파싱 — "ko,en;q=0.9,..." 형태
  // 우선순위 1위 locale이 ko로 시작하면 한국어, 아니면 영어
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const primaryLocale = acceptLanguage.split(",")[0]?.trim().toLowerCase() ?? "";
  const lang = primaryLocale.startsWith("ko") ? "ko" : "en";

  response.cookies.set("lang", lang, {
    maxAge: 60 * 60 * 24 * 365, // 1년
    path: "/",
    sameSite: "lax",
  });

  return response;
}

export const config = {
  // _next 정적 파일, API 라우트, 메타 파일은 제외
  matcher: ["/((?!_next|api|favicon|robots|sitemap).*)"],
};
