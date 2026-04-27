// 무한 스크롤용 포스트 목록 API
// GET /api/posts?cursor=...&tag=...&lang=ko|en
// lang=en 시 포스트 제목/설명을 DeepL로 번역해서 반환 (서버 캐시 2시간)

import { NextRequest, NextResponse } from "next/server";
import { getPostPage } from "@/lib/services/post.service";
import { translatePostsMeta } from "@/lib/services/translation.service";
import { getLang } from "@/lib/i18n";
import type { PostListPage } from "@/types";

export async function GET(req: NextRequest): Promise<NextResponse<PostListPage>> {
  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
  const tag = req.nextUrl.searchParams.get("tag") ?? undefined;
  const lang = getLang(req.nextUrl.searchParams.get("lang") ?? undefined);

  const result = await getPostPage({ pageSize: 10, cursor, tag });

  const posts = lang === "en"
    ? (await translatePostsMeta(result.posts)).posts
    : result.posts;

  return NextResponse.json({ ...result, posts });
}
