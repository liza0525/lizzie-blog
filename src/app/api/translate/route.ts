// 번역 API 엔드포인트
// GET /api/translate?pageId=xxx
// DeepL로 번역된 마크다운을 반환 (서버 캐시 2시간)

import { NextResponse } from "next/server";
import { getTranslatedPostContent } from "@/lib/services/translation.service";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("pageId");

  if (!pageId) {
    return NextResponse.json({ error: "pageId 파라미터가 필요합니다" }, { status: 400 });
  }

  const content = await getTranslatedPostContent(pageId);
  return NextResponse.json({ content });
}
