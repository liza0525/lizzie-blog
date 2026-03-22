// 포스트 본문 캐시 수동 무효화 API
// 노션에서 글을 수정한 후 즉시 캐시를 갱신하고 싶을 때 호출
//
// 사용법:
//   특정 글 무효화: GET /api/revalidate?token=<secret>&slug=<slug>
//
// 환경변수 REVALIDATE_SECRET 설정 필요

import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get("token");
  const slug = req.nextUrl.searchParams.get("slug");

  if (token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!slug) {
    return NextResponse.json(
      { revalidated: false, message: "slug 파라미터를 지정해주세요" },
      { status: 400 }
    );
  }

  // 해당 포스트 페이지 경로를 무효화 — 다음 요청 시 unstable_cache 포함 전체 재fetch
  revalidatePath(`/posts/${slug}`, "page");
  return NextResponse.json({ revalidated: true, slug });
}
