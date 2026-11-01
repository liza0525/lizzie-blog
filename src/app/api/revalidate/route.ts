// 포스트 본문 캐시 수동 무효화 API
// 노션에서 글을 수정한 후 즉시 캐시를 갱신하고 싶을 때 호출
//
// 사용법:
//   특정 글 무효화: GET /api/revalidate?token=<secret>&slug=<slug>
//
// 환경변수 REVALIDATE_SECRET 설정 필요

import { type NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

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

  // "post" 태그가 붙은 unstable_cache 전체 즉시 만료 — 다음 요청이 새로 fetch한 결과를 바로 받음
  // "default"/"max" 프로필은 stale-while-revalidate라 무효화 직후 첫 방문에 옛 내용이 한 번 더 보임
  revalidateTag("post", { expire: 0 });
  return NextResponse.json({ revalidated: true, slug });
}
