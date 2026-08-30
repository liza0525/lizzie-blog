// Notion 이미지 프록시 — S3 signed URL의 1시간 만료 문제를 우회
// blockId 또는 pageId를 받아 Notion API로 신선한 URL을 받고, 그 자리에서 바로 이미지를 fetch해 바이트를 직접 응답
//
// 주의: redirect 방식은 쓰지 않는다. Notion이 발급하는 signed URL은 X-Amz-Expires=3600(1시간)이라고
// 적혀 있지만, 내부적으로 서명에 쓰인 임시 STS 자격증명 자체의 실제 수명이 그보다 짧아 1시간이 되기
// 전에 S3가 ExpiredToken을 반환하는 경우가 있다. redirect 응답을 max-age로 캐싱해두면 그 캐시가
// 살아있는 동안 방문자 전원이 깨진 이미지를 보게 된다. 여기서 바이트를 직접 받아 응답하면 signed URL은
// "발급 직후 서버가 바로 사용"하는 용도로만 쓰이므로 그 짧은 수명 문제에서 자유롭고, 캐시 기간은
// (URL이 아닌) 실제 이미지 콘텐츠 기준으로 우리가 원하는 만큼 길게 잡을 수 있다.
import { type NextRequest, NextResponse } from "next/server";
import { notionClient } from "@/lib/notion/client";
import type {
  ImageBlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

const CACHE_CONTROL = "public, max-age=86400, s-maxage=86400";

async function respondWithImage(url: string): Promise<NextResponse> {
  const imageRes = await fetch(url);
  if (!imageRes.ok || !imageRes.body) {
    return NextResponse.json({ error: "Failed to fetch image from source" }, { status: 502 });
  }

  return new NextResponse(imageRes.body, {
    headers: {
      "Content-Type": imageRes.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": CACHE_CONTROL,
    },
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const blockId = searchParams.get("blockId");
  const pageId = searchParams.get("pageId");

  try {
    if (blockId) {
      const block = await notionClient.blocks.retrieve({ block_id: blockId });
      if (!("type" in block) || block.type !== "image") {
        return NextResponse.json({ error: "Not an image block" }, { status: 400 });
      }

      const imageBlock = block as ImageBlockObjectResponse;
      const url =
        imageBlock.image.type === "file"
          ? imageBlock.image.file.url
          : imageBlock.image.external.url;

      return respondWithImage(url);
    }

    if (pageId) {
      const page = await notionClient.pages.retrieve({ page_id: pageId });
      if (!("cover" in page) || !page.cover) {
        return NextResponse.json({ error: "No cover image" }, { status: 404 });
      }

      const typedPage = page as PageObjectResponse;
      const url =
        typedPage.cover?.type === "file"
          ? typedPage.cover.file.url
          : typedPage.cover?.type === "external"
          ? typedPage.cover.external.url
          : null;

      if (!url) {
        return NextResponse.json({ error: "Unsupported cover type" }, { status: 400 });
      }

      return respondWithImage(url);
    }

    return NextResponse.json({ error: "blockId or pageId required" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
