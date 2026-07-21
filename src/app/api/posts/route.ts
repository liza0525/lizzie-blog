// 무한 스크롤용 포스트 목록 API
// GET /api/posts?cursor=...&tag=...

import { NextRequest, NextResponse } from "next/server";
import { getPostPage } from "@/lib/services/post.service";
import type { PostListPage, PostType } from "@/types";

function parseType(value: string | null): PostType | undefined {
  return value === "essay" || value === "note" ? value : undefined;
}

export async function GET(req: NextRequest): Promise<NextResponse<PostListPage>> {
  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
  const tag = req.nextUrl.searchParams.get("tag") ?? undefined;
  const type = parseType(req.nextUrl.searchParams.get("type"));

  const result = await getPostPage({ pageSize: 10, cursor, tag, type });

  return NextResponse.json(result);
}
