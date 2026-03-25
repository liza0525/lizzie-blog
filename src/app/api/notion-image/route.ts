// Notion 이미지 프록시 — S3 signed URL의 1시간 만료 문제를 우회
// blockId 또는 pageId를 받아 Notion API로 신선한 URL을 받아 redirect
// Cache-Control: max-age=3000 (50분) → S3 만료 전에 브라우저가 재요청하도록

import { type NextRequest, NextResponse } from "next/server";
import { notionClient } from "@/lib/notion/client";
import type {
  ImageBlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

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

      return NextResponse.redirect(url, {
        headers: { "Cache-Control": "public, max-age=3000, s-maxage=3000" },
      });
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

      return NextResponse.redirect(url, {
        headers: { "Cache-Control": "public, max-age=3000, s-maxage=3000" },
      });
    }

    return NextResponse.json({ error: "blockId or pageId required" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
